import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, Between } from "typeorm";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { CreateCarWashDTO } from "src/presentation/dtos/washing/create-washing.dto";
import { User, UserRole } from "src/core/domain/entities/user.entity";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { Customer } from "src/core/domain/entities/customer.entity";
import { PaginatedResponse, buildPaginatedResponse } from "src/presentation/dtos/pagination/paginated-response.dto";

@Injectable()
export class CarWashService {
  constructor(
    @InjectRepository(CarWash)
    private carWashRepository: Repository<CarWash>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createCarWashDTO: CreateCarWashDTO, shopId: number): Promise<CarWash> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createCarWashDTO.vehicleId, shopId },
    });

    if (!vehicle) {
      throw new BadRequestException("Veículo não encontrado ou não pertence à loja");
    }

    const customer = await this.customerRepository.findOne({
      where: { id: createCarWashDTO.customerId, shopId },
    });

    if (!customer) {
      throw new BadRequestException("Cliente não encontrado ou não pertence à loja");
    }

    const employees = await this.userRepository.findBy({
      id: In(createCarWashDTO.employeeIds),
      role: UserRole.EMPLOYEE,
      shopId,
    });

    if (employees.length !== createCarWashDTO.employeeIds.length) {
      throw new BadRequestException("Um ou mais funcionários não pertencem à loja");
    }

    const carWash = this.carWashRepository.create({
      ...createCarWashDTO,
      shopId,
      dateTime: new Date(),
      employees,
    });

    return await this.carWashRepository.save(carWash);
  }

  async findAll(shopId: number, page = 1, limit = 10): Promise<PaginatedResponse<CarWash>> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.carWashRepository.findAndCount({
      where: { shopId },
      relations: ["vehicle", "customer", "employees"],
      order: { dateTime: "DESC" },
      skip,
      take: limit,
    });
    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number, shopId: number): Promise<CarWash> {
    return await this.carWashRepository.findOne({
      where: { id, shopId },
      relations: ["vehicle", "customer", "employees"],
    });
  }

  async findByDateRange(startDate: Date, endDate: Date, shopId: number): Promise<CarWash[]> {
    return await this.carWashRepository.find({
      where: {
        dateTime: Between(startDate, endDate),
        shopId,
      },
      relations: ["vehicle", "customer", "employees"],
      order: { dateTime: "DESC" },
    });
  }

  async findByDateRangeAllShops(
    startDate: Date,
    endDate: Date,
    shopId: number | null,
  ): Promise<CarWash[]> {
    const where: any = { dateTime: Between(startDate, endDate) };
    if (shopId != null) where.shopId = shopId;
    return await this.carWashRepository.find({
      where,
      relations: ["vehicle", "customer", "employees", "shop"],
      order: { dateTime: "DESC" },
    });
  }

  async findMyWashes(
    employeeUserId: number,
    shopId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<CarWash[]> {
    const qb = this.carWashRepository
      .createQueryBuilder("cw")
      .innerJoin("cw.employees", "emp", "emp.id = :employeeUserId", { employeeUserId })
      .leftJoinAndSelect("cw.vehicle", "vehicle")
      .leftJoinAndSelect("cw.customer", "customer")
      .where("cw.shopId = :shopId", { shopId });

    if (startDate && endDate) {
      qb.andWhere("cw.dateTime BETWEEN :startDate AND :endDate", { startDate, endDate });
    }
    qb.orderBy("cw.dateTime", "DESC");
    return await qb.getMany();
  }

  async updateStatus(id: number, status: "paid" | "pending", shopId: number): Promise<CarWash> {
    await this.carWashRepository.update({ id, shopId }, { paymentStatus: status as any });
    return await this.findOne(id, shopId);
  }

  async updatePayment(
    id: number,
    payload: { amount?: number; paymentMethod?: string; paymentStatus?: string },
    shopId: number,
  ): Promise<CarWash> {
    const wash = await this.carWashRepository.findOne({ where: { id, shopId } });
    if (!wash) {
      throw new BadRequestException("Lavagem não encontrada ou não pertence à loja");
    }
    const update: Partial<CarWash> = {};
    if (payload.amount != null) update.amount = payload.amount as any;
    if (payload.paymentMethod != null) update.paymentMethod = payload.paymentMethod as any;
    if (payload.paymentStatus != null) update.paymentStatus = payload.paymentStatus as any;
    await this.carWashRepository.update({ id, shopId }, update);
    return await this.findOne(id, shopId);
  }

  async remove(id: number, shopId: number): Promise<void> {
    await this.carWashRepository.softDelete({ id, shopId });
  }

  async getChartData(shopId: number | null, days: number): Promise<{
    dailyRevenue: Array<{ date: string; revenue: number; count: number }>;
    washesByType: Record<string, number>;
  }> {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    let washes: CarWash[];
    if (shopId === null) {
      washes = await this.findByDateRangeAllShops(startDate, endDate, null);
    } else {
      washes = await this.findByDateRange(startDate, endDate, shopId);
    }

    const dailyMap = new Map<string, { revenue: number; count: number }>();
    const typeMap: Record<string, number> = { simples: 0, completa: 0, polimento: 0 };

    for (const wash of washes) {
      const dateKey = new Date(wash.dateTime).toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey) || { revenue: 0, count: 0 };
      existing.count++;
      if (wash.paymentStatus === 'paid') {
        existing.revenue += Number(wash.amount || 0);
      }
      dailyMap.set(dateKey, existing);

      const type = wash.serviceType as string;
      if (typeMap[type] !== undefined) {
        typeMap[type]++;
      }
    }

    const dailyRevenue: Array<{ date: string; revenue: number; count: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateKey = d.toISOString().split('T')[0];
      const data = dailyMap.get(dateKey) || { revenue: 0, count: 0 };
      dailyRevenue.push({ date: dateKey, revenue: data.revenue, count: data.count });
    }

    return { dailyRevenue, washesByType: typeMap };
  }
}

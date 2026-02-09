import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, Between } from "typeorm";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { CreateCarWashDTO } from "src/presentation/dtos/washing/create-washing.dto";
import { User, UserRole } from "src/core/domain/entities/user.entity";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { Customer } from "src/core/domain/entities/customer.entity";

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

  async findAll(shopId: number): Promise<CarWash[]> {
    return await this.carWashRepository.find({
      where: { shopId },
      relations: ["vehicle", "customer", "employees"],
      order: { dateTime: "DESC" },
    });
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
}

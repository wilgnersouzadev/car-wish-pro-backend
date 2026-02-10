import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { Customer } from "src/core/domain/entities/customer.entity";
import { CreateVehicleDTO } from "src/presentation/dtos/vehicle/create-vehicle.dto";
import { PaginatedResponse, buildPaginatedResponse } from "src/presentation/dtos/pagination/paginated-response.dto";

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createVehicleDTO: CreateVehicleDTO, shopId: number): Promise<Vehicle> {
    const customer = await this.customerRepository.findOne({
      where: { id: createVehicleDTO.customerId, shopId },
    });

    if (!customer) {
      throw new BadRequestException("Cliente não encontrado ou não pertence à loja");
    }

    const existingVehicle = await this.vehicleRepository.findOne({
      where: { licensePlate: createVehicleDTO.licensePlate, shopId },
    });

    if (existingVehicle) {
      throw new BadRequestException("Já existe um veículo com esta placa nesta loja");
    }

    const vehicle = this.vehicleRepository.create({ ...createVehicleDTO, shopId });
    return await this.vehicleRepository.save(vehicle);
  }

  async findAll(
    shopId: number,
    search?: string,
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
    sortBy = "createdAt",
    sortOrder: "ASC" | "DESC" = "DESC",
  ): Promise<PaginatedResponse<Vehicle>> {
    const skip = (page - 1) * limit;

    const qb = this.vehicleRepository
      .createQueryBuilder("v")
      .leftJoinAndSelect("v.customer", "customer")
      .leftJoinAndSelect("v.carWashes", "carWashes")
      .where("v.shopId = :shopId", { shopId });

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        "(v.licensePlate ILIKE :term OR v.model ILIKE :term OR v.color ILIKE :term OR customer.name ILIKE :term)",
        { term },
      );
    }

    if (startDate) {
      qb.andWhere("v.createdAt >= :startDate", { startDate: new Date(startDate) });
    }

    if (endDate) {
      qb.andWhere("v.createdAt <= :endDate", { endDate: new Date(endDate) });
    }

    const validSortFields = ["licensePlate", "model", "color", "createdAt", "updatedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    qb.orderBy(`v.${sortField}`, sortOrder);

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number, shopId: number): Promise<Vehicle> {
    return await this.vehicleRepository.findOne({
      where: { id, shopId },
      relations: ["customer", "carWashes"],
    });
  }

  async findByPlate(plate: string, shopId: number): Promise<Vehicle[]> {
    const term = `%${plate.trim()}%`;
    return await this.vehicleRepository.find({
      where: { shopId, licensePlate: ILike(term) },
      relations: ["customer", "carWashes"],
      order: { createdAt: "DESC" },
    });
  }

  async update(
    id: number,
    updateData: Partial<CreateVehicleDTO>,
    shopId: number,
  ): Promise<Vehicle> {
    if (updateData.customerId) {
      const customer = await this.customerRepository.findOne({
        where: { id: updateData.customerId, shopId },
      });

      if (!customer) {
        throw new BadRequestException("Cliente não encontrado ou não pertence à loja");
      }
    }

    await this.vehicleRepository.update({ id, shopId }, updateData);
    return await this.findOne(id, shopId);
  }

  async remove(id: number, shopId: number): Promise<void> {
    await this.vehicleRepository.softDelete({ id, shopId });
  }
}


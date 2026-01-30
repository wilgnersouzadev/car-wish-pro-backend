import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { Customer } from "src/core/domain/entities/customer.entity";
import { CreateVehicleDTO } from "src/presentation/dtos/vehicle/create-vehicle.dto";

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

  async findAll(shopId: number, search?: string): Promise<Vehicle[]> {
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      return await this.vehicleRepository
        .createQueryBuilder("v")
        .leftJoinAndSelect("v.customer", "customer")
        .leftJoinAndSelect("v.carWashes", "carWashes")
        .where("v.shopId = :shopId", { shopId })
        .andWhere(
          "(v.licensePlate ILIKE :term OR v.model ILIKE :term OR v.color ILIKE :term OR customer.name ILIKE :term)",
          { term },
        )
        .orderBy("v.createdAt", "DESC")
        .getMany();
    }
    return await this.vehicleRepository.find({
      where: { shopId },
      relations: ["customer", "carWashes"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number, shopId: number): Promise<Vehicle> {
    return await this.vehicleRepository.findOne({
      where: { id, shopId },
      relations: ["customer", "carWashes"],
    });
  }

  /** Busca por placa com ILIKE (aproximada, case-insensitive). Retorna todos os que contêm o termo. */
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


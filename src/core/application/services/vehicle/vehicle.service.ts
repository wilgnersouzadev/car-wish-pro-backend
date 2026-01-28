import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { CreateVehicleDTO } from "src/presentation/dtos/vehicle/create-vehicle.dto";

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDTO: CreateVehicleDTO): Promise<Vehicle> {
    const vehicle = this.vehicleRepository.create(createVehicleDTO);
    return await this.vehicleRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return await this.vehicleRepository.find({
      relations: ["customer", "carWashes"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number): Promise<Vehicle> {
    return await this.vehicleRepository.findOne({
      where: { id },
      relations: ["customer", "carWashes"],
    });
  }

  async findByPlate(licensePlate: string): Promise<Vehicle> {
    return await this.vehicleRepository.findOne({
      where: { licensePlate },
      relations: ["customer", "carWashes"],
    });
  }

  async update(id: number, updateData: Partial<CreateVehicleDTO>): Promise<Vehicle> {
    await this.vehicleRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.vehicleRepository.softDelete(id);
  }
}


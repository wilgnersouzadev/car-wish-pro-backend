import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In, Between } from "typeorm";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { CreateCarWashDTO } from "src/presentation/dtos/washing/create-washing.dto";
import { User } from "src/core/domain/entities/user.entity";
import { UserRole } from "src/core/domain/entities/user.entity";

@Injectable()
export class CarWashService {
  constructor(
    @InjectRepository(CarWash)
    private carWashRepository: Repository<CarWash>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createCarWashDTO: CreateCarWashDTO): Promise<CarWash> {
    const employees = await this.userRepository.findBy({
      id: In(createCarWashDTO.employeeIds),
      role: UserRole.EMPLOYEE,
    });

    const carWash = this.carWashRepository.create({
      ...createCarWashDTO,
      dateTime: new Date(),
      employees,
    });

    return await this.carWashRepository.save(carWash);
  }

  async findAll(): Promise<CarWash[]> {
    return await this.carWashRepository.find({
      relations: ["vehicle", "customer", "employees"],
      order: { dateTime: "DESC" },
    });
  }

  async findOne(id: number): Promise<CarWash> {
    return await this.carWashRepository.findOne({
      where: { id },
      relations: ["vehicle", "customer", "employees"],
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<CarWash[]> {
    return await this.carWashRepository.find({
      where: {
        dateTime: Between(startDate, endDate),
      },
      relations: ["vehicle", "customer", "employees"],
      order: { dateTime: "DESC" },
    });
  }

  async updateStatus(id: number, status: "paid" | "pending"): Promise<CarWash> {
    await this.carWashRepository.update(id, { paymentStatus: status as any });
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.carWashRepository.softDelete(id);
  }
}

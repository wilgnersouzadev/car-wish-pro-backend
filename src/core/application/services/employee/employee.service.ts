import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Employee } from "src/core/domain/entities/employee.entity";
import { CreateEmployeeDTO } from "src/presentation/dtos/employee/create-employee.dto";

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDTO: CreateEmployeeDTO): Promise<Employee> {
    const employee = this.employeeRepository.create(createEmployeeDTO);
    return await this.employeeRepository.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return await this.employeeRepository.find({
      relations: ["lavagens"],
    });
  }

  async findOne(id: number): Promise<Employee> {
    return await this.employeeRepository.findOne({
      where: { id },
      relations: ["carWashes"],
    });
  }

  async update(id: number, updateData: Partial<CreateEmployeeDTO>): Promise<Employee> {
    await this.employeeRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.employeeRepository.softDelete(id);
  }
}

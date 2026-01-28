import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Customer } from "src/core/domain/entities/customer.entity";
import { CreateCustomerDTO } from "src/presentation/dtos/customer/create-customer.dto";

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDTO: CreateCustomerDTO): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDTO);
    return await this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepository.find({
      relations: ["vehicles", "washes"],
    });
  }

  async findOne(id: number): Promise<Customer> {
    return await this.customerRepository.findOne({
      where: { id },
      relations: ["vehicles", "washes"],
    });
  }

  async update(id: number, updateData: Partial<CreateCustomerDTO>): Promise<Customer> {
    await this.customerRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.customerRepository.softDelete(id);
  }
}


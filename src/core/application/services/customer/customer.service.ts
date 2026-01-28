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

  async create(createCustomerDTO: CreateCustomerDTO, shopId: number): Promise<Customer> {
    const customer = this.customerRepository.create({ ...createCustomerDTO, shopId });
    return await this.customerRepository.save(customer);
  }

  async findAll(shopId: number): Promise<Customer[]> {
    return await this.customerRepository.find({
      where: { shopId },
      relations: ["vehicles", "washes"],
    });
  }

  async findOne(id: number, shopId: number): Promise<Customer> {
    return await this.customerRepository.findOne({
      where: { id, shopId },
      relations: ["vehicles", "washes"],
    });
  }

  async update(
    id: number,
    updateData: Partial<CreateCustomerDTO>,
    shopId: number,
  ): Promise<Customer> {
    await this.customerRepository.update({ id, shopId }, updateData);
    return await this.findOne(id, shopId);
  }

  async remove(id: number, shopId: number): Promise<void> {
    await this.customerRepository.softDelete({ id, shopId });
  }
}


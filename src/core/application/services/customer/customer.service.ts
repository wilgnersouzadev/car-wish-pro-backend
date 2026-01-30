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

  async findAll(shopId: number, search?: string): Promise<Customer[]> {
    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      return await this.customerRepository
        .createQueryBuilder("customer")
        .leftJoinAndSelect("customer.vehicles", "vehicles")
        .leftJoinAndSelect("customer.washes", "washes")
        .where("customer.shopId = :shopId", { shopId })
        .andWhere(
          "(customer.name ILIKE :term OR customer.phone ILIKE :term OR customer.notes ILIKE :term)",
          { term },
        )
        .orderBy("customer.name", "ASC")
        .getMany();
    }
    return await this.customerRepository.find({
      where: { shopId },
      relations: ["vehicles", "washes"],
      order: { name: "ASC" },
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


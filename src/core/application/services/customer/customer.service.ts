import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Customer } from "src/core/domain/entities/customer.entity";
import { CreateCustomerDTO } from "src/presentation/dtos/customer/create-customer.dto";
import { PaginatedResponse, buildPaginatedResponse } from "src/presentation/dtos/pagination/paginated-response.dto";

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

  async findAll(
    shopId: number,
    search?: string,
    page = 1,
    limit = 10,
    startDate?: string,
    endDate?: string,
    sortBy = "name",
    sortOrder: "ASC" | "DESC" = "ASC",
  ): Promise<PaginatedResponse<Customer>> {
    const skip = (page - 1) * limit;

    const qb = this.customerRepository
      .createQueryBuilder("customer")
      .leftJoinAndSelect("customer.vehicles", "vehicles")
      .leftJoinAndSelect("customer.washes", "washes")
      .where("customer.shopId = :shopId", { shopId });

    if (search?.trim()) {
      const term = `%${search.trim()}%`;
      qb.andWhere(
        "(customer.name ILIKE :term OR customer.phone ILIKE :term OR customer.notes ILIKE :term)",
        { term },
      );
    }

    if (startDate) {
      qb.andWhere("customer.createdAt >= :startDate", { startDate: new Date(startDate) });
    }

    if (endDate) {
      qb.andWhere("customer.createdAt <= :endDate", { endDate: new Date(endDate) });
    }

    const validSortFields = ["name", "createdAt", "updatedAt", "phone"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "name";
    qb.orderBy(`customer.${sortField}`, sortOrder);

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return buildPaginatedResponse(data, total, page, limit);
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


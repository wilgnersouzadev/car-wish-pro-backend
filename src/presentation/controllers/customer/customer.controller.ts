import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CustomerService } from "src/core/application/services/customer/customer.service";
import { CreateCustomerDTO } from "src/presentation/dtos/customer/create-customer.dto";
import { Customer } from "src/core/domain/entities/customer.entity";

@ApiTags("Customers")
@Controller("customers")
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: "Criar novo cliente" })
  @ApiResponse({ status: 201, description: "Cliente criado com sucesso" })
  async create(@Body() createCustomerDTO: CreateCustomerDTO): Promise<Customer> {
    return await this.customerService.create(createCustomerDTO);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos os clientes" })
  @ApiResponse({ status: 200, description: "Lista de clientes" })
  async findAll(): Promise<Customer[]> {
    return await this.customerService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar cliente por ID" })
  @ApiResponse({ status: 200, description: "Cliente encontrado" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Customer> {
    return await this.customerService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Atualizar cliente" })
  @ApiResponse({ status: 200, description: "Cliente atualizado com sucesso" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCustomerDTO: Partial<CreateCustomerDTO>,
  ): Promise<Customer> {
    return await this.customerService.update(id, updateCustomerDTO);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deletar cliente" })
  @ApiResponse({ status: 200, description: "Cliente deletado com sucesso" })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.customerService.remove(id);
  }
}


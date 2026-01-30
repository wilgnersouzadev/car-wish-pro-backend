import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { CustomerService } from "src/core/application/services/customer/customer.service";
import { CreateCustomerDTO } from "src/presentation/dtos/customer/create-customer.dto";
import { Customer } from "src/core/domain/entities/customer.entity";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";

@ApiTags("Customers")
@Controller("customers")
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: "Criar novo cliente" })
  @ApiResponse({ status: 201, description: "Cliente criado com sucesso" })
  async create(
    @Body() createCustomerDTO: CreateCustomerDTO,
    @ShopId() shopId: number,
  ): Promise<Customer> {
    return await this.customerService.create(createCustomerDTO, shopId);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos os clientes da loja" })
  @ApiQuery({ name: "search", required: false, description: "Busca aproximada por nome, telefone ou observações (ILIKE)" })
  @ApiResponse({ status: 200, description: "Lista de clientes" })
  async findAll(
    @ShopId() shopId: number,
    @Query("search") search?: string,
  ): Promise<Customer[]> {
    return await this.customerService.findAll(shopId, search);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar cliente por ID" })
  @ApiResponse({ status: 200, description: "Cliente encontrado" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @ShopId() shopId: number,
  ): Promise<Customer> {
    return await this.customerService.findOne(id, shopId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Atualizar cliente" })
  @ApiResponse({ status: 200, description: "Cliente atualizado com sucesso" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCustomerDTO: Partial<CreateCustomerDTO>,
    @ShopId() shopId: number,
  ): Promise<Customer> {
    return await this.customerService.update(id, updateCustomerDTO, shopId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deletar cliente" })
  @ApiResponse({ status: 200, description: "Cliente deletado com sucesso" })
  async remove(@Param("id", ParseIntPipe) id: number, @ShopId() shopId: number): Promise<void> {
    return await this.customerService.remove(id, shopId);
  }
}


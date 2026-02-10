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
import { VehicleService } from "src/core/application/services/vehicle/vehicle.service";
import { CreateVehicleDTO } from "src/presentation/dtos/vehicle/create-vehicle.dto";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";
import { PaginationDTO } from "src/presentation/dtos/pagination/pagination.dto";
import { PaginatedResponse } from "src/presentation/dtos/pagination/paginated-response.dto";

@ApiTags("Vehicles")
@Controller("vehicles")
@ApiBearerAuth()
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiOperation({ summary: "Criar novo veículo" })
  async create(
    @Body() createVehicleDTO: CreateVehicleDTO,
    @ShopId() shopId: number,
  ): Promise<Vehicle> {
    return await this.vehicleService.create(createVehicleDTO, shopId);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos os veículos da loja" })
  @ApiQuery({ name: "search", required: false, description: "Busca aproximada por placa, modelo, cor ou nome do cliente (ILIKE)" })
  async findAll(
    @ShopId() shopId: number,
    @Query("search") search?: string,
    @Query() pagination?: PaginationDTO,
  ): Promise<PaginatedResponse<Vehicle>> {
    return await this.vehicleService.findAll(shopId, search, pagination?.page, pagination?.limit);
  }

  @Get("plate/:plate")
  @ApiOperation({ summary: "Buscar veículos por placa (aproximado, case-insensitive)" })
  async findByPlate(@Param("plate") plate: string, @ShopId() shopId: number): Promise<Vehicle[]> {
    return await this.vehicleService.findByPlate(plate, shopId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar veículo por ID" })
  async findOne(@Param("id", ParseIntPipe) id: number, @ShopId() shopId: number): Promise<Vehicle> {
    return await this.vehicleService.findOne(id, shopId);
  }

  @Put(":id")
  @ApiOperation({ summary: "Atualizar veículo" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateVehicleDTO: Partial<CreateVehicleDTO>,
    @ShopId() shopId: number,
  ): Promise<Vehicle> {
    return await this.vehicleService.update(id, updateVehicleDTO, shopId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deletar veículo" })
  async remove(@Param("id", ParseIntPipe) id: number, @ShopId() shopId: number): Promise<void> {
    return await this.vehicleService.remove(id, shopId);
  }
}

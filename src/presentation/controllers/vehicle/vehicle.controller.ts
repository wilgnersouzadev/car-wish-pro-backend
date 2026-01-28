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
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { VehicleService } from "src/core/application/services/vehicle/vehicle.service";
import { CreateVehicleDTO } from "src/presentation/dtos/vehicle/create-vehicle.dto";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";

@ApiTags("Vehicles")
@Controller("vehicles")
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiOperation({ summary: "Criar novo veículo" })
  async create(@Body() createVehicleDTO: CreateVehicleDTO): Promise<Vehicle> {
    return await this.vehicleService.create(createVehicleDTO);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos os veículos" })
  async findAll(): Promise<Vehicle[]> {
    return await this.vehicleService.findAll();
  }

  @Get("plate/:plate")
  @ApiOperation({ summary: "Buscar veículo por placa" })
  async findByPlate(@Param("plate") plate: string): Promise<Vehicle> {
    return await this.vehicleService.findByPlate(plate);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar veículo por ID" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Vehicle> {
    return await this.vehicleService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Atualizar veículo" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateVehicleDTO: Partial<CreateVehicleDTO>,
  ): Promise<Vehicle> {
    return await this.vehicleService.update(id, updateVehicleDTO);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deletar veículo" })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.vehicleService.remove(id);
  }
}

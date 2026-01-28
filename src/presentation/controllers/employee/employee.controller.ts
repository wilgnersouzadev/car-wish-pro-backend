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
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { EmployeeService } from "src/core/application/services/employee/employee.service";
import { CreateEmployeeDTO } from "src/presentation/dtos/employee/create-employee.dto";
import { Employee } from "src/core/domain/entities/employee.entity";

@ApiTags("Employees")
@Controller("employees")
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @ApiOperation({ summary: "Criar novo funcionário" })
  async create(@Body() createEmployeeDTO: CreateEmployeeDTO): Promise<Employee> {
    return await this.employeeService.create(createEmployeeDTO);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos os funcionários" })
  async findAll(): Promise<Employee[]> {
    return await this.employeeService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar funcionário por ID" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Employee> {
    return await this.employeeService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Atualizar funcionário" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateEmployeeDTO: Partial<CreateEmployeeDTO>,
  ): Promise<Employee> {
    return await this.employeeService.update(id, updateEmployeeDTO);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deletar funcionário" })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.employeeService.remove(id);
  }
}

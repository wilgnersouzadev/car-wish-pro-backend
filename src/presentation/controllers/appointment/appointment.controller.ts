import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { AppointmentService } from "src/core/application/services/appointment/appointment.service";
import { CreateAppointmentDto } from "src/presentation/dtos/appointment/create-appointment.dto";
import { UpdateAppointmentDto } from "src/presentation/dtos/appointment/update-appointment.dto";
import { QueryAppointmentDto } from "src/presentation/dtos/appointment/query-appointment.dto";
import { AvailableSlotsDto } from "src/presentation/dtos/appointment/available-slots.dto";
import { Appointment } from "src/core/domain/entities/appointment.entity";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";
import { CurrentUser } from "src/core/application/decorators/current-user.decorator";
import { PaginatedResponse } from "src/presentation/dtos/pagination/paginated-response.dto";

@ApiTags("Appointments")
@Controller("appointments")
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({ summary: "Criar novo agendamento" })
  @ApiResponse({ status: 201, description: "Agendamento criado com sucesso" })
  @ApiResponse({ status: 400, description: "Dados inválidos ou horário indisponível" })
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @ShopId() shopId: number,
    @CurrentUser("userId") userId: number,
  ): Promise<Appointment> {
    return await this.appointmentService.create(createAppointmentDto, shopId, userId);
  }

  @Get()
  @ApiOperation({ summary: "Listar agendamentos com filtros" })
  @ApiResponse({ status: 200, description: "Lista de agendamentos paginada" })
  async findAll(
    @ShopId() shopId: number,
    @Query() query: QueryAppointmentDto,
  ): Promise<PaginatedResponse<Appointment>> {
    return await this.appointmentService.findAll(shopId, query);
  }

  @Get("available-slots")
  @ApiOperation({ summary: "Obter horários disponíveis para um dia" })
  @ApiQuery({ name: "date", required: true, description: "Data no formato YYYY-MM-DD" })
  @ApiResponse({ status: 200, description: "Lista de horários disponíveis" })
  async getAvailableSlots(
    @ShopId() shopId: number,
    @Query() query: AvailableSlotsDto,
  ): Promise<string[]> {
    return await this.appointmentService.getAvailableSlots(shopId, query.date);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar agendamento por ID" })
  @ApiResponse({ status: 200, description: "Agendamento encontrado" })
  @ApiResponse({ status: 404, description: "Agendamento não encontrado" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @ShopId() shopId: number,
  ): Promise<Appointment> {
    return await this.appointmentService.findOne(id, shopId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Atualizar agendamento" })
  @ApiResponse({ status: 200, description: "Agendamento atualizado com sucesso" })
  @ApiResponse({ status: 400, description: "Dados inválidos ou horário indisponível" })
  @ApiResponse({ status: 404, description: "Agendamento não encontrado" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @ShopId() shopId: number,
  ): Promise<Appointment> {
    return await this.appointmentService.update(id, updateAppointmentDto, shopId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deletar agendamento" })
  @ApiResponse({ status: 200, description: "Agendamento deletado com sucesso" })
  @ApiResponse({ status: 404, description: "Agendamento não encontrado" })
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @ShopId() shopId: number,
  ): Promise<void> {
    return await this.appointmentService.remove(id, shopId);
  }

  @Patch(":id/confirm")
  @ApiOperation({ summary: "Confirmar agendamento" })
  @ApiResponse({ status: 200, description: "Agendamento confirmado com sucesso" })
  @ApiResponse({ status: 400, description: "Não é possível confirmar este agendamento" })
  @ApiResponse({ status: 404, description: "Agendamento não encontrado" })
  async confirm(
    @Param("id", ParseIntPipe) id: number,
    @ShopId() shopId: number,
  ): Promise<Appointment> {
    return await this.appointmentService.confirmAppointment(id, shopId);
  }

  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancelar agendamento" })
  @ApiResponse({ status: 200, description: "Agendamento cancelado com sucesso" })
  @ApiResponse({ status: 400, description: "Não é possível cancelar este agendamento" })
  @ApiResponse({ status: 404, description: "Agendamento não encontrado" })
  async cancel(
    @Param("id", ParseIntPipe) id: number,
    @ShopId() shopId: number,
  ): Promise<Appointment> {
    return await this.appointmentService.cancelAppointment(id, shopId);
  }

  @Patch(":id/complete")
  @ApiOperation({ summary: "Concluir agendamento" })
  @ApiResponse({ status: 200, description: "Agendamento concluído com sucesso" })
  @ApiResponse({ status: 400, description: "Não é possível concluir este agendamento" })
  @ApiResponse({ status: 404, description: "Agendamento não encontrado" })
  async complete(
    @Param("id", ParseIntPipe) id: number,
    @ShopId() shopId: number,
  ): Promise<Appointment> {
    return await this.appointmentService.completeAppointment(id, shopId);
  }
}

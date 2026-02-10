import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { Appointment, AppointmentStatus } from "src/core/domain/entities/appointment.entity";
import { CreateAppointmentDto } from "src/presentation/dtos/appointment/create-appointment.dto";
import { UpdateAppointmentDto } from "src/presentation/dtos/appointment/update-appointment.dto";
import { QueryAppointmentDto } from "src/presentation/dtos/appointment/query-appointment.dto";
import { PaginatedResponse, buildPaginatedResponse } from "src/presentation/dtos/pagination/paginated-response.dto";

@Injectable()
export class AppointmentService {
  // Configurações de horário de funcionamento
  private readonly OPENING_HOUR = 8; // 8h
  private readonly CLOSING_HOUR = 18; // 18h
  private readonly SLOT_DURATION_MINUTES = 30; // 30 minutos por slot

  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
    shopId: number,
    userId: number,
  ): Promise<Appointment> {
    // Validar se a data não é no passado
    const appointmentDateTime = new Date(`${createAppointmentDto.scheduledDate}T${createAppointmentDto.scheduledTime}`);
    const now = new Date();

    if (appointmentDateTime < now) {
      throw new BadRequestException("Não é possível agendar para uma data/hora passada");
    }

    // Validar se o horário está dentro do expediente
    const [hours] = createAppointmentDto.scheduledTime.split(":").map(Number);
    if (hours < this.OPENING_HOUR || hours >= this.CLOSING_HOUR) {
      throw new BadRequestException(
        `Horário deve estar entre ${this.OPENING_HOUR}:00 e ${this.CLOSING_HOUR}:00`,
      );
    }

    // Verificar disponibilidade
    const isAvailable = await this.checkAvailability(
      shopId,
      createAppointmentDto.scheduledDate,
      createAppointmentDto.scheduledTime,
    );

    if (!isAvailable) {
      throw new BadRequestException("Horário não disponível");
    }

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      shopId,
      createdBy: userId,
      status: AppointmentStatus.PENDING,
    });

    return await this.appointmentRepository.save(appointment);
  }

  async findAll(
    shopId: number,
    query: QueryAppointmentDto,
  ): Promise<PaginatedResponse<Appointment>> {
    const { startDate, endDate, status, customerId, vehicleId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const qb = this.appointmentRepository
      .createQueryBuilder("appointment")
      .leftJoinAndSelect("appointment.customer", "customer")
      .leftJoinAndSelect("appointment.vehicle", "vehicle")
      .leftJoinAndSelect("appointment.creator", "creator")
      .where("appointment.shopId = :shopId", { shopId });

    if (startDate) {
      qb.andWhere("appointment.scheduledDate >= :startDate", { startDate });
    }

    if (endDate) {
      qb.andWhere("appointment.scheduledDate <= :endDate", { endDate });
    }

    if (status) {
      qb.andWhere("appointment.status = :status", { status });
    }

    if (customerId) {
      qb.andWhere("appointment.customerId = :customerId", { customerId });
    }

    if (vehicleId) {
      qb.andWhere("appointment.vehicleId = :vehicleId", { vehicleId });
    }

    qb.orderBy("appointment.scheduledDate", "ASC")
      .addOrderBy("appointment.scheduledTime", "ASC");

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number, shopId: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, shopId },
      relations: ["customer", "vehicle", "creator"],
    });

    if (!appointment) {
      throw new NotFoundException("Agendamento não encontrado");
    }

    return appointment;
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    shopId: number,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id, shopId);

    // Se estiver alterando data/hora, validar disponibilidade
    if (updateAppointmentDto.scheduledDate || updateAppointmentDto.scheduledTime) {
      const newDate = updateAppointmentDto.scheduledDate || appointment.scheduledDate;
      const newTime = updateAppointmentDto.scheduledTime || appointment.scheduledTime;

      // Validar se a data não é no passado
      const appointmentDateTime = new Date(`${newDate}T${newTime}`);
      const now = new Date();

      if (appointmentDateTime < now) {
        throw new BadRequestException("Não é possível agendar para uma data/hora passada");
      }

      // Validar horário de funcionamento
      const [hours] = newTime.split(":").map(Number);
      if (hours < this.OPENING_HOUR || hours >= this.CLOSING_HOUR) {
        throw new BadRequestException(
          `Horário deve estar entre ${this.OPENING_HOUR}:00 e ${this.CLOSING_HOUR}:00`,
        );
      }

      // Verificar disponibilidade (excluindo o próprio agendamento)
      const isAvailable = await this.checkAvailability(shopId, newDate, newTime, id);
      if (!isAvailable) {
        throw new BadRequestException("Horário não disponível");
      }
    }

    await this.appointmentRepository.update({ id, shopId }, updateAppointmentDto);
    return await this.findOne(id, shopId);
  }

  async remove(id: number, shopId: number): Promise<void> {
    await this.findOne(id, shopId); // Verificar se existe
    await this.appointmentRepository.softDelete({ id, shopId });
  }

  async confirmAppointment(id: number, shopId: number): Promise<Appointment> {
    const appointment = await this.findOne(id, shopId);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException("Não é possível confirmar um agendamento cancelado");
    }

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException("Agendamento já foi concluído");
    }

    appointment.status = AppointmentStatus.CONFIRMED;
    return await this.appointmentRepository.save(appointment);
  }

  async cancelAppointment(id: number, shopId: number): Promise<Appointment> {
    const appointment = await this.findOne(id, shopId);

    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException("Não é possível cancelar um agendamento já concluído");
    }

    appointment.status = AppointmentStatus.CANCELLED;
    return await this.appointmentRepository.save(appointment);
  }

  async completeAppointment(id: number, shopId: number): Promise<Appointment> {
    const appointment = await this.findOne(id, shopId);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException("Não é possível concluir um agendamento cancelado");
    }

    appointment.status = AppointmentStatus.COMPLETED;
    return await this.appointmentRepository.save(appointment);
  }

  async checkAvailability(
    shopId: number,
    date: string,
    time: string,
    excludeId?: number,
  ): Promise<boolean> {
    const qb = this.appointmentRepository
      .createQueryBuilder("appointment")
      .where("appointment.shopId = :shopId", { shopId })
      .andWhere("appointment.scheduledDate = :date", { date })
      .andWhere("appointment.scheduledTime = :time", { time })
      .andWhere("appointment.status != :cancelledStatus", {
        cancelledStatus: AppointmentStatus.CANCELLED,
      });

    if (excludeId) {
      qb.andWhere("appointment.id != :excludeId", { excludeId });
    }

    const count = await qb.getCount();
    return count === 0;
  }

  async getAvailableSlots(shopId: number, date: string): Promise<string[]> {
    // Validar se a data não é no passado
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const isToday = targetDate.getTime() === today.getTime();
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();

    // Buscar agendamentos existentes para o dia
    const existingAppointments = await this.appointmentRepository.find({
      where: {
        shopId,
        scheduledDate: date,
        status: Between(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED),
      },
      select: ["scheduledTime"],
    });

    const bookedTimes = new Set(existingAppointments.map((a) => a.scheduledTime));

    // Gerar todos os slots disponíveis
    const availableSlots: string[] = [];

    for (let hour = this.OPENING_HOUR; hour < this.CLOSING_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += this.SLOT_DURATION_MINUTES) {
        const timeSlot = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

        // Se for hoje, não mostrar horários que já passaram
        if (isToday) {
          if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
            continue;
          }
        }

        // Verificar se o slot não está ocupado
        if (!bookedTimes.has(timeSlot)) {
          availableSlots.push(timeSlot);
        }
      }
    }

    return availableSlots;
  }

  async getAppointmentsByDateRange(
    shopId: number,
    startDate: string,
    endDate: string,
  ): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: {
        shopId,
        scheduledDate: Between(startDate, endDate),
      },
      relations: ["customer", "vehicle"],
      order: {
        scheduledDate: "ASC",
        scheduledTime: "ASC",
      },
    });
  }
}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Appointment } from "src/core/domain/entities/appointment.entity";
import { AppointmentService } from "src/core/application/services/appointment/appointment.service";
import { AppointmentController } from "./appointment.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Appointment])],
  providers: [AppointmentService],
  controllers: [AppointmentController],
  exports: [AppointmentService],
})
export class AppointmentModule {}

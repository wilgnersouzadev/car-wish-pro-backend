import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseDataSource } from "src/core/domain/data.source";
import { Customer } from "src/core/domain/entities/customer.entity";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { Employee } from "src/core/domain/entities/employee.entity";
import { Service } from "src/core/domain/entities/service.entity";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { User } from "src/core/domain/entities/user.entity";

import { CustomerModule } from "src/presentation/controllers/customer/customer.module";
import { VehicleModule } from "src/presentation/controllers/vehicle/vehicle.module";
import { WashingModule } from "src/presentation/controllers/washing/washing.module";
import { EmployeeModule } from "src/presentation/controllers/employee/employee.module";
import { DashboardModule } from "src/presentation/controllers/dashboard/dashboard.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(DatabaseDataSource),
    TypeOrmModule.forFeature([User, Customer, Vehicle, Employee, Service, CarWash]),
    CustomerModule,
    VehicleModule,
    WashingModule,
    EmployeeModule,
    DashboardModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

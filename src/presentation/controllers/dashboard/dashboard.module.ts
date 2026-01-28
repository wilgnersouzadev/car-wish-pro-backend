import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { WashingModule } from "../washing/washing.module";
import { EmployeeModule } from "../employee/employee.module";

@Module({
  imports: [WashingModule, EmployeeModule],
  controllers: [DashboardController],
})
export class DashboardModule {}

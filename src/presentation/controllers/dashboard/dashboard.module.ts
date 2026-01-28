import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller";
import { WashingModule } from "../washing/washing.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [WashingModule, UserModule],
  controllers: [DashboardController],
})
export class DashboardModule {}

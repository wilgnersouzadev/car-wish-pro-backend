import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { User } from "src/core/domain/entities/user.entity";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { Customer } from "src/core/domain/entities/customer.entity";
import { CarWashService } from "src/core/application/services/washing/washing.service";
import { WashingController } from "./washing.controller";

@Module({
  imports: [TypeOrmModule.forFeature([CarWash, User, Vehicle, Customer])],
  controllers: [WashingController],
  providers: [CarWashService],
  exports: [CarWashService],
})
export class WashingModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { VehicleService } from "src/core/application/services/vehicle/vehicle.service";
import { VehicleController } from "./vehicle.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle])],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}

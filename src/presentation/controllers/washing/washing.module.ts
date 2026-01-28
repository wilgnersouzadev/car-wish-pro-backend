import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { User } from "src/core/domain/entities/user.entity";
import { CarWashService } from "src/core/application/services/washing/washing.service";
import { WashingController } from "./washing.controller";

@Module({
  imports: [TypeOrmModule.forFeature([CarWash, User])],
  controllers: [WashingController],
  providers: [CarWashService],
  exports: [CarWashService],
})
export class WashingModule {}

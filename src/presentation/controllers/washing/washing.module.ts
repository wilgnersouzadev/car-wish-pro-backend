import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { User } from "src/core/domain/entities/user.entity";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { Customer } from "src/core/domain/entities/customer.entity";
import { CarWashService } from "src/core/application/services/washing/washing.service";
import { WashingController } from "./washing.controller";
import { WebsocketsModule } from "src/presentation/websockets/websockets.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { LoyaltyModule } from "../loyalty/loyalty.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([CarWash, User, Vehicle, Customer]),
    WebsocketsModule,
    NotificationsModule,
    forwardRef(() => LoyaltyModule),
  ],
  controllers: [WashingController],
  providers: [CarWashService],
  exports: [CarWashService],
})
export class WashingModule {}

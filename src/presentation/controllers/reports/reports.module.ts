import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { Shop } from "src/core/domain/entities/shop.entity";
import { User } from "src/core/domain/entities/user.entity";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { Customer } from "src/core/domain/entities/customer.entity";
import { ExportService } from "src/core/application/services/export/export.service";
import { CarWashService } from "src/core/application/services/washing/washing.service";
import { ShopService } from "src/core/application/services/shop/shop.service";
import { ReportsController } from "./reports.controller";
import { WebsocketsModule } from "src/presentation/websockets/websockets.module";
import { LoyaltyModule } from "src/presentation/controllers/loyalty/loyalty.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([CarWash, Shop, User, Vehicle, Customer]),
    WebsocketsModule,
    forwardRef(() => LoyaltyModule),
  ],
  controllers: [ReportsController],
  providers: [ExportService, CarWashService, ShopService],
  exports: [ExportService],
})
export class ReportsModule {}

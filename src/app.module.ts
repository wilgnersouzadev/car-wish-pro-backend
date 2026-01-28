import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseDataSource } from "src/core/domain/data.source";
import { Customer } from "src/core/domain/entities/customer.entity";
import { Vehicle } from "src/core/domain/entities/vehicle.entity";
import { Service } from "src/core/domain/entities/service.entity";
import { CarWash } from "src/core/domain/entities/car-wash.entity";
import { User } from "src/core/domain/entities/user.entity";
import { Shop } from "src/core/domain/entities/shop.entity";

import { CustomerModule } from "src/presentation/controllers/customer/customer.module";
import { UserModule } from "src/presentation/controllers/user/user.module";
import { VehicleModule } from "src/presentation/controllers/vehicle/vehicle.module";
import { WashingModule } from "src/presentation/controllers/washing/washing.module";
import { DashboardModule } from "src/presentation/controllers/dashboard/dashboard.module";
import { AuthModule } from "src/presentation/controllers/auth/auth.module";
import { ShopModule } from "src/presentation/controllers/shop/shop.module";
import { AppController } from "./app.controller";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "src/core/application/guards/jwt-auth.guard";
import { TenantGuard } from "src/core/application/guards/tenant.guard";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(DatabaseDataSource),
    TypeOrmModule.forFeature([User, Customer, Vehicle, Service, CarWash, Shop]),
    AuthModule,
    ShopModule,
    UserModule,
    CustomerModule,
    VehicleModule,
    WashingModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}

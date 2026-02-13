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
import { Notification } from "src/core/domain/entities/notification.entity";
import { Appointment } from "src/core/domain/entities/appointment.entity";
import { LoyaltyProgram } from "src/core/domain/entities/loyalty-program.entity";
import { LoyaltyCard } from "src/core/domain/entities/loyalty-card.entity";
import { LoyaltyTransaction } from "src/core/domain/entities/loyalty-transaction.entity";
import { Review } from "src/core/domain/entities/review.entity";

import { CustomerModule } from "src/presentation/controllers/customer/customer.module";
import { UserModule } from "src/presentation/controllers/user/user.module";
import { VehicleModule } from "src/presentation/controllers/vehicle/vehicle.module";
import { WashingModule } from "src/presentation/controllers/washing/washing.module";
import { DashboardModule } from "src/presentation/controllers/dashboard/dashboard.module";
import { AuthModule } from "src/presentation/controllers/auth/auth.module";
import { ShopModule } from "src/presentation/controllers/shop/shop.module";
import { ReportsModule } from "src/presentation/controllers/reports/reports.module";
import { NotificationsModule } from "src/presentation/controllers/notifications/notifications.module";
import { WebsocketsModule } from "src/presentation/websockets/websockets.module";
import { UploadsModule } from "src/presentation/controllers/uploads/uploads.module";
import { AppointmentModule } from "src/presentation/controllers/appointment/appointment.module";
import { LoyaltyModule } from "src/presentation/controllers/loyalty/loyalty.module";
import { TrackingModule } from "src/presentation/controllers/tracking/tracking.module";
import { PatioModule } from "src/presentation/controllers/patio/patio.module";
import { ReviewModule } from "src/presentation/controllers/review/review.module";
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
    TypeOrmModule.forFeature([
      User,
      Customer,
      Vehicle,
      Service,
      CarWash,
      Shop,
      Notification,
      Appointment,
      LoyaltyProgram,
      LoyaltyCard,
      LoyaltyTransaction,
      Review,
    ]),
    AuthModule,
    ShopModule,
    UserModule,
    CustomerModule,
    VehicleModule,
    WashingModule,
    DashboardModule,
    ReportsModule,
    NotificationsModule,
    WebsocketsModule,
    UploadsModule,
    AppointmentModule,
    LoyaltyModule,
    TrackingModule,
    PatioModule,
    ReviewModule,
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

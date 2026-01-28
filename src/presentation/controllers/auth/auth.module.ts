import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/core/domain/entities/user.entity";
import { Shop } from "src/core/domain/entities/shop.entity";
import { AuthService } from "src/core/application/services/auth/auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "src/core/application/strategies/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Shop]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "your-secret-key-change-in-production"),
        signOptions: { expiresIn: "7d" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

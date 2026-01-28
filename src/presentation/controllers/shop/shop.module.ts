import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Shop } from "src/core/domain/entities/shop.entity";
import { User } from "src/core/domain/entities/user.entity";
import { ShopService } from "src/core/application/services/shop/shop.service";
import { ShopController } from "./shop.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Shop, User])],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}

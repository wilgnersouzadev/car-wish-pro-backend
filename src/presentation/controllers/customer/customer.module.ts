import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "src/core/domain/entities/customer.entity";
import { CustomerService } from "src/core/application/services/customer/customer.service";
import { CustomerController } from "./customer.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}


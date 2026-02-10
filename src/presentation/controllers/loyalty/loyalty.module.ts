import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LoyaltyController } from "./loyalty.controller";
import { LoyaltyService } from "src/core/application/services/loyalty/loyalty.service";
import { LoyaltyProgram } from "src/core/domain/entities/loyalty-program.entity";
import { LoyaltyCard } from "src/core/domain/entities/loyalty-card.entity";
import { LoyaltyTransaction } from "src/core/domain/entities/loyalty-transaction.entity";
import { Customer } from "src/core/domain/entities/customer.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([LoyaltyProgram, LoyaltyCard, LoyaltyTransaction, Customer]),
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}

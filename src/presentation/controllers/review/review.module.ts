import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewController } from "./review.controller";
import { ReviewService } from "../../../core/application/services/review/review.service";
import { Review } from "../../../core/domain/entities/review.entity";
import { CarWash } from "../../../core/domain/entities/car-wash.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Review, CarWash])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}

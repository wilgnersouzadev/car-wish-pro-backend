import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Review } from "../../../domain/entities/review.entity";
import { CarWash } from "../../../domain/entities/car-wash.entity";
import { CreateReviewDto } from "../../dtos/review/create-review.dto";
import { RespondReviewDto } from "../../dtos/review/respond-review.dto";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(CarWash)
    private readonly carWashRepository: Repository<CarWash>,
  ) {}

  async create(createReviewDto: CreateReviewDto, customerId: number): Promise<Review> {
    const carWash = await this.carWashRepository.findOne({
      where: { id: createReviewDto.carWashId },
      relations: ["customer", "shop"],
    });

    if (!carWash) {
      throw new NotFoundException("Lavagem não encontrada");
    }

    if (carWash.customer.id !== customerId) {
      throw new BadRequestException("Você não pode avaliar esta lavagem");
    }

    // Verificar se já existe review para esta lavagem
    const existingReview = await this.reviewRepository.findOne({
      where: { carWashId: createReviewDto.carWashId },
    });

    if (existingReview) {
      throw new BadRequestException("Você já avaliou esta lavagem");
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      customerId,
      shopId: carWash.shopId,
    });

    return this.reviewRepository.save(review);
  }

  async createPublic(createReviewDto: CreateReviewDto): Promise<Review> {
    const carWash = await this.carWashRepository.findOne({
      where: { id: createReviewDto.carWashId },
      relations: ["customer", "shop"],
    });

    if (!carWash) {
      throw new NotFoundException("Lavagem não encontrada");
    }

    // Verificar se já existe review para esta lavagem
    const existingReview = await this.reviewRepository.findOne({
      where: { carWashId: createReviewDto.carWashId },
    });

    if (existingReview) {
      throw new BadRequestException("Esta lavagem já foi avaliada");
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      customerId: carWash.customer.id,
      shopId: carWash.shopId,
    });

    return this.reviewRepository.save(review);
  }

  async findByShop(shopId: number, page = 1, limit = 10) {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { shopId },
      relations: ["customer", "carWash", "carWash.vehicle"],
      order: { createdAt: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const averageRating = await this.reviewRepository
      .createQueryBuilder("review")
      .select("AVG(review.rating)", "avg")
      .where("review.shopId = :shopId", { shopId })
      .getRawOne();

    const ratingDistribution = await this.reviewRepository
      .createQueryBuilder("review")
      .select("review.rating", "rating")
      .addSelect("COUNT(*)", "count")
      .where("review.shopId = :shopId", { shopId })
      .groupBy("review.rating")
      .getRawMany();

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      averageRating: parseFloat(averageRating?.avg || "0").toFixed(1),
      ratingDistribution: ratingDistribution.reduce((acc, curr) => {
        acc[curr.rating] = parseInt(curr.count);
        return acc;
      }, {} as Record<number, number>),
    };
  }

  async findByCustomer(customerId: number) {
    return this.reviewRepository.find({
      where: { customerId },
      relations: ["shop", "carWash", "carWash.vehicle"],
      order: { createdAt: "DESC" },
    });
  }

  async respondReview(reviewId: number, respondReviewDto: RespondReviewDto, shopId: number) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Avaliação não encontrada");
    }

    if (review.shopId !== shopId) {
      throw new BadRequestException("Você não pode responder esta avaliação");
    }

    review.response = respondReviewDto.response;
    review.respondedAt = new Date();

    return this.reviewRepository.save(review);
  }

  async getPublicReviews(shopId: number, limit = 5) {
    return this.reviewRepository.find({
      where: { shopId },
      relations: ["customer"],
      order: { createdAt: "DESC" },
      take: limit,
    });
  }
}

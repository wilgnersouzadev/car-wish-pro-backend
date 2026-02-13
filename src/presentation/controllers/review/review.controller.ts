import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { ReviewService } from "../../../core/application/services/review/review.service";
import { CreateReviewDto } from "../../../core/application/dtos/review/create-review.dto";
import { RespondReviewDto } from "../../../core/application/dtos/review/respond-review.dto";
import { ShopId } from "../../../core/application/decorators/shop-id.decorator";
import { CustomerId } from "../../../core/application/decorators/customer-id.decorator";
import { Public } from "../../../core/application/decorators/public.decorator";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: "Criar avaliação (público)" })
  @ApiResponse({ status: 201, description: "Avaliação criada com sucesso" })
  async create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.createPublic(createReviewDto);
  }

  @Get("shop")
  @ApiOperation({ summary: "Listar avaliações da loja" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async findByShop(
    @ShopId() shopId: number,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.reviewService.findByShop(shopId, page, limit);
  }

  @Get("customer")
  @ApiOperation({ summary: "Listar avaliações do cliente" })
  async findByCustomer(@CustomerId() customerId: number) {
    return this.reviewService.findByCustomer(customerId);
  }

  @Get("public/:shopId")
  @Public()
  @ApiOperation({ summary: "Obter avaliações públicas da loja" })
  async getPublicReviews(
    @Param("shopId", ParseIntPipe) shopId: number,
    @Query("limit") limit?: number,
  ) {
    return this.reviewService.getPublicReviews(shopId, limit);
  }

  @Patch(":id/response")
  @ApiOperation({ summary: "Responder avaliação (loja)" })
  async respondReview(
    @Param("id", ParseIntPipe) id: number,
    @Body() respondReviewDto: RespondReviewDto,
    @ShopId() shopId: number,
  ) {
    return this.reviewService.respondReview(id, respondReviewDto, shopId);
  }
}

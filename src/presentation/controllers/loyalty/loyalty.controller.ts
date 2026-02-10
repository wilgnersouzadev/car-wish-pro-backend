import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { LoyaltyService } from "src/core/application/services/loyalty/loyalty.service";
import { CreateProgramDTO } from "src/presentation/dtos/loyalty/create-program.dto";
import { UpdateProgramDTO } from "src/presentation/dtos/loyalty/update-program.dto";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";
import { RolesGuard, Roles } from "src/core/application/guards/roles.guard";
import { UserRole } from "src/core/domain/entities/user.entity";

@ApiTags("Loyalty Program")
@Controller("loyalty")
@ApiBearerAuth()
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Post("programs")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Criar programa de fidelidade (Admin/Super Admin)" })
  @ApiResponse({ status: 201, description: "Programa criado com sucesso" })
  @ApiResponse({ status: 400, description: "Já existe um programa ativo" })
  async createProgram(@Body() dto: CreateProgramDTO, @ShopId() shopId: number) {
    return await this.loyaltyService.createProgram(shopId, dto);
  }

  @Get("programs")
  @ApiOperation({ summary: "Listar todos os programas da loja" })
  async getAllPrograms(@ShopId() shopId: number) {
    return await this.loyaltyService.getAllPrograms(shopId);
  }

  @Get("programs/active")
  @ApiOperation({ summary: "Obter programa ativo" })
  async getActiveProgram(@ShopId() shopId: number) {
    return await this.loyaltyService.getProgram(shopId);
  }

  @Patch("programs/:id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Atualizar programa de fidelidade (Admin/Super Admin)" })
  async updateProgram(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateProgramDTO,
    @ShopId() shopId: number,
  ) {
    return await this.loyaltyService.updateProgram(id, shopId, dto);
  }

  @Post("programs/:id/toggle")
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Ativar/desativar programa (Admin/Super Admin)" })
  async toggleProgram(@Param("id", ParseIntPipe) id: number, @ShopId() shopId: number) {
    return await this.loyaltyService.toggleProgramStatus(id, shopId);
  }

  @Get("cards/:customerId")
  @ApiOperation({ summary: "Obter cartão de fidelidade do cliente" })
  async getCustomerCard(@Param("customerId", ParseIntPipe) customerId: number, @ShopId() shopId: number) {
    return await this.loyaltyService.getCardStatus(customerId, shopId);
  }

  @Post("cards/:customerId")
  @ApiOperation({ summary: "Criar ou obter cartão de fidelidade" })
  async getOrCreateCard(@Param("customerId", ParseIntPipe) customerId: number, @ShopId() shopId: number) {
    return await this.loyaltyService.getOrCreateCard(customerId, shopId);
  }

  @Post("cards/:customerId/earn")
  @ApiOperation({ summary: "Adicionar ponto ao cliente (chamado após lavagem)" })
  async earnPoints(
    @Param("customerId", ParseIntPipe) customerId: number,
    @Body("carWashId") carWashId: number,
    @ShopId() shopId: number,
  ) {
    return await this.loyaltyService.earnPoints(customerId, shopId, carWashId);
  }

  @Post("cards/:customerId/redeem")
  @ApiOperation({ summary: "Resgatar recompensa" })
  @ApiResponse({ status: 200, description: "Recompensa resgatada com sucesso" })
  @ApiResponse({ status: 400, description: "Pontos insuficientes" })
  async redeemReward(@Param("customerId", ParseIntPipe) customerId: number, @ShopId() shopId: number) {
    return await this.loyaltyService.redeemReward(customerId, shopId);
  }

  @Get("transactions/:cardId")
  @ApiOperation({ summary: "Obter histórico de transações do cartão" })
  async getTransactions(@Param("cardId", ParseIntPipe) cardId: number, @ShopId() shopId: number) {
    return await this.loyaltyService.getTransactions(cardId, shopId);
  }

  @Get("stats")
  @ApiOperation({ summary: "Estatísticas do programa de fidelidade da loja" })
  async getStats(@ShopId() shopId: number) {
    return await this.loyaltyService.getShopStats(shopId);
  }

  @Get("customers")
  @ApiOperation({ summary: "Listar clientes no programa de fidelidade" })
  async getCustomersInProgram(@ShopId() shopId: number) {
    return await this.loyaltyService.getCustomersInProgram(shopId);
  }
}

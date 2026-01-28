import { Controller, Get, Post, Body, Param, UseGuards, Query, Put } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { ShopService } from "src/core/application/services/shop/shop.service";
import { CreateShopDTO } from "src/presentation/dtos/shop/create-shop.dto";
import { RegisterOwnerDTO } from "src/presentation/dtos/shop/register-owner.dto";
import { AddShopToOwnerDTO } from "src/presentation/dtos/shop/add-shop-to-owner.dto";
import { Shop } from "src/core/domain/entities/shop.entity";
import { Public } from "src/core/application/decorators/public.decorator";
import { Roles } from "src/core/application/guards/roles.guard";
import { RolesGuard } from "src/core/application/guards/roles.guard";
import { UserRole } from "src/core/domain/entities/user.entity";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";
import { CurrentUser } from "src/core/application/decorators/current-user.decorator";

@ApiTags("Shops")
@Controller("shops")
@ApiBearerAuth()
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post("register-owner")
  @Public()
  @ApiOperation({ summary: "Registrar novo dono e criar loja" })
  @ApiResponse({ status: 201, description: "Dono e loja criados com sucesso" })
  @ApiResponse({ status: 409, description: "Slug ou email já cadastrado" })
  async registerOwner(@Body() registerOwnerDTO: RegisterOwnerDTO) {
    return await this.shopService.registerOwner(registerOwnerDTO);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: "Listar lojas (super admin vê todas, admin vê apenas a sua)" })
  @ApiQuery({ name: "shopId", required: false, description: "Filtrar por loja específica (apenas super admin)" })
  @ApiResponse({ status: 200, description: "Lista de lojas" })
  async findAll(
    @ShopId() shopId: number | null,
    @CurrentUser() user: any,
  ): Promise<Shop[]> {
    // Super admin vê todas as lojas (ou pode filtrar por shopId via query param)
    if (user.role === UserRole.SUPER_ADMIN) {
      return await this.shopService.findAll(shopId);
    }
    // Admin vê apenas suas lojas (via ManyToMany)
    return await this.shopService.findAll(null, user.sub);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: "Criar nova loja (super admin cria sem vincular, admin vincula automaticamente)" })
  @ApiResponse({ status: 201, description: "Loja criada com sucesso" })
  @ApiResponse({ status: 409, description: "Slug já cadastrado" })
  async create(@Body() createShopDTO: CreateShopDTO, @CurrentUser() user: any): Promise<Shop> {
    // Super admin cria loja sem vincular, admin vincula automaticamente
    const userId = user.role === UserRole.SUPER_ADMIN ? null : user.sub;
    return await this.shopService.create(createShopDTO, userId);
  }

  @Put(":id/add-to-owner")
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: "Vincular loja existente a um admin (apenas super admin)" })
  @ApiResponse({ status: 200, description: "Loja vinculada com sucesso" })
  @ApiResponse({ status: 404, description: "Loja ou admin não encontrado" })
  async addShopToOwner(@Param("id") shopId: number, @Body() dto: AddShopToOwnerDTO): Promise<Shop> {
    return await this.shopService.addShopToOwner(shopId, dto.ownerId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar loja por ID" })
  @ApiResponse({ status: 200, description: "Loja encontrada" })
  async findOne(@Param("id") id: number): Promise<Shop> {
    return await this.shopService.findOne(id);
  }
}

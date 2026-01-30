import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { UserService } from "src/core/application/services/user/user.service";
import { CreateUserDTO } from "src/presentation/dtos/user/create-user.dto";
import { User, UserRole } from "src/core/domain/entities/user.entity";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";
import { CurrentUser } from "src/core/application/decorators/current-user.decorator";
import { Public } from "src/core/application/decorators/public.decorator";
import { Roles } from "src/core/application/guards/roles.guard";
import { RolesGuard } from "src/core/application/guards/roles.guard";

@ApiTags("Users")
@Controller("users")
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("me")
  @ApiOperation({ summary: "Obter dados do usuário logado" })
  @ApiResponse({ status: 200, description: "Dados do usuário" })
  async getMe(@CurrentUser() user: any): Promise<Omit<User, "password">> {
    return await this.userService.findMe(user.sub);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: "Cadastrar novo usuário (super admin ou admin da loja)" })
  @ApiQuery({ name: "shopId", required: false, description: "ID da loja (apenas super admin, admin usa a loja do token)" })
  @ApiResponse({ status: 201, description: "Usuário criado com sucesso" })
  @ApiResponse({ status: 409, description: "Email já cadastrado" })
  async create(
    @Body() createUserDTO: CreateUserDTO,
    @Query("shopId") shopId?: string,
  ): Promise<Omit<User, "password">> {
    const targetShopId = shopId ? parseInt(shopId, 10) : null;
    return await this.userService.create(createUserDTO, Number.isNaN(targetShopId as any) ? null : targetShopId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: "Listar usuários (super admin vê todos, admin vê apenas da sua loja)" })
  @ApiQuery({ name: "role", enum: UserRole, required: false, description: "Filtrar por role" })
  @ApiQuery({ name: "shopId", required: false, description: "Filtrar por loja específica (apenas super admin)" })
  @ApiQuery({ name: "search", required: false, description: "Busca aproximada por nome ou email (ILIKE)" })
  @ApiResponse({ status: 200, description: "Lista de usuários" })
  async findAll(
    @ShopId() shopId: number | null,
    @Query("role") role?: UserRole,
    @Query("search") search?: string,
    @CurrentUser() user?: any,
  ): Promise<Omit<User, "password">[]> {
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
    return await this.userService.findAll(shopId, role, isSuperAdmin, search);
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar usuário por ID" })
  @ApiResponse({ status: 200, description: "Usuário encontrado" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @ShopId() shopId: number | null,
    @CurrentUser() user?: any,
  ): Promise<Omit<User, "password">> {
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
    return await this.userService.findOne(id, shopId, isSuperAdmin);
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: "Atualizar usuário (super admin ou admin da loja)" })
  @ApiResponse({ status: 200, description: "Usuário atualizado com sucesso" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDTO: Partial<CreateUserDTO>,
    @ShopId() shopId: number | null,
    @CurrentUser() user?: any,
  ): Promise<Omit<User, "password">> {
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
    return await this.userService.update(id, updateUserDTO, shopId, isSuperAdmin);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: "Deletar usuário (super admin ou admin da loja)" })
  @ApiResponse({ status: 200, description: "Usuário deletado com sucesso" })
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @ShopId() shopId: number | null,
    @CurrentUser() user?: any,
  ): Promise<void> {
    const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
    return await this.userService.remove(id, shopId, isSuperAdmin);
  }
}

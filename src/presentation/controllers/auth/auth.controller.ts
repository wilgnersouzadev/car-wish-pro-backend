import { Controller, Post, Body, UseGuards, Put } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "src/core/application/services/auth/auth.service";
import { LoginDTO } from "src/presentation/dtos/auth/login.dto";
import { SwitchShopDTO } from "./switch-shop.dto";
import { Public } from "src/core/application/decorators/public.decorator";
import { CurrentUser } from "src/core/application/decorators/current-user.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @Public()
  @ApiOperation({ summary: "Login de usuário" })
  @ApiResponse({ status: 200, description: "Login realizado com sucesso" })
  @ApiResponse({ status: 401, description: "Credenciais inválidas" })
  async login(@Body() loginDTO: LoginDTO) {
    return await this.authService.login(loginDTO);
  }

  @Put("switch-shop")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Trocar contexto de loja (apenas para admins com múltiplas lojas)" })
  @ApiResponse({ status: 200, description: "Contexto de loja alterado com sucesso" })
  @ApiResponse({ status: 403, description: "Você não tem acesso a esta loja" })
  async switchShop(@Body() switchShopDTO: SwitchShopDTO, @CurrentUser() user: any) {
    return await this.authService.switchShop(user.sub, switchShopDTO.shopId);
  }
}

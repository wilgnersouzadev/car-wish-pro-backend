import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserService } from "src/core/application/services/user/user.service";
import { CreateUserDTO } from "src/presentation/dtos/user/create-user.dto";
import { User } from "src/core/domain/entities/user.entity";

@ApiTags("Users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Cadastrar novo usuário" })
  @ApiResponse({ status: 201, description: "Usuário criado com sucesso" })
  @ApiResponse({ status: 409, description: "Email já cadastrado" })
  async create(@Body() createUserDTO: CreateUserDTO): Promise<Omit<User, "password">> {
    return await this.userService.create(createUserDTO);
  }

  @Get()
  @ApiOperation({ summary: "Listar todos os usuários" })
  @ApiResponse({ status: 200, description: "Lista de usuários" })
  async findAll(): Promise<Omit<User, "password">[]> {
    return await this.userService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Buscar usuário por ID" })
  @ApiResponse({ status: 200, description: "Usuário encontrado" })
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<Omit<User, "password">> {
    return await this.userService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Atualizar usuário" })
  @ApiResponse({ status: 200, description: "Usuário atualizado com sucesso" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDTO: Partial<CreateUserDTO>,
  ): Promise<Omit<User, "password">> {
    return await this.userService.update(id, updateUserDTO);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deletar usuário" })
  @ApiResponse({ status: 200, description: "Usuário deletado com sucesso" })
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return await this.userService.remove(id);
  }
}

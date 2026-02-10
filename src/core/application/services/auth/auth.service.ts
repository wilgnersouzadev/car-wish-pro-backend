import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "src/core/domain/entities/user.entity";
import { Shop } from "src/core/domain/entities/shop.entity";
import { LoginDTO } from "src/presentation/dtos/auth/login.dto";

export interface JwtPayload {
  sub: number;
  email: string;
  shopId: number | null;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ["shops"],
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        shopId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        shops: {
          id: true,
          name: true,
          slug: true,
        },
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginDTO: LoginDTO): Promise<{ access_token: string; user: Omit<User, "password">; shops?: Shop[] }> {
    const user = await this.validateUser(loginDTO.email, loginDTO.password);
    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    let targetShopId: number | null = user.shopId;

    if (user.role === "admin" && loginDTO.shopId) {
      const hasAccess = user.shops?.some((shop) => shop.id === loginDTO.shopId);
      if (!hasAccess) {
        throw new UnauthorizedException("Você não tem acesso a esta loja");
      }
      targetShopId = loginDTO.shopId;
      await this.userRepository.update(user.id, { shopId: loginDTO.shopId });
    } else if (user.role === "admin" && user.shops && user.shops.length > 0 && !user.shopId) {
      targetShopId = user.shops[0].id;
      await this.userRepository.update(user.id, { shopId: targetShopId });
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      shopId: targetShopId,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;
    return {
      access_token,
      user: userWithoutPassword,
      shops: user.shops,
    };
  }

  async switchShop(userId: number, shopId: number | null): Promise<{ access_token: string; shopId: number | null }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["shops"],
    });

    if (!user) {
      throw new UnauthorizedException("Usuário não encontrado");
    }

    if (shopId === null) {
      if (user.role !== "super_admin") {
        throw new UnauthorizedException("Apenas super admins podem desmarcar a loja");
      }
    } else if (user.role === "admin") {
      const hasAccess = user.shops?.some((shop) => shop.id === shopId);
      if (!hasAccess) {
        throw new UnauthorizedException("Você não tem acesso a esta loja");
      }
    } else if (user.role !== "super_admin") {
      throw new UnauthorizedException("Apenas admins podem trocar de loja");
    }

    await this.userRepository.update(userId, { shopId });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      shopId,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      shopId,
    };
  }
}

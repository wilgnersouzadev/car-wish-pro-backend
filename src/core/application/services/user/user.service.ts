import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import { User, UserRole } from "src/core/domain/entities/user.entity";
import { CreateUserDTO } from "src/presentation/dtos/user/create-user.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDTO: CreateUserDTO, shopId: number | null): Promise<Omit<User, "password">> {
    if (createUserDTO.role === UserRole.EMPLOYEE) {
      if (createUserDTO.commissionType == null || createUserDTO.commissionValue == null) {
        throw new BadRequestException("Funcionários devem ter tipo e valor de comissão");
      }
    }
    // Super admin pode ter shopId null, outros roles precisam de shopId
    if (createUserDTO.role !== UserRole.SUPER_ADMIN && !shopId) {
      throw new BadRequestException("shopId é obrigatório para este tipo de usuário");
    }
    const existing = await this.userRepository.findOne({
      where: { email: createUserDTO.email },
    });
    if (existing) {
      throw new ConflictException("Já existe um usuário com este email");
    }
    const hashedPassword = await bcrypt.hash(createUserDTO.password, 10);
    const payload = {
      ...createUserDTO,
      password: hashedPassword,
      shopId: createUserDTO.role === UserRole.SUPER_ADMIN ? null : shopId,
      commissionType: createUserDTO.role === UserRole.EMPLOYEE ? createUserDTO.commissionType : null,
      commissionValue: createUserDTO.role === UserRole.EMPLOYEE ? createUserDTO.commissionValue : null,
    };
    const user = this.userRepository.create(payload);
    const saved = await this.userRepository.save(user);
    const isSuperAdmin = createUserDTO.role === UserRole.SUPER_ADMIN;
    return this.findOne(saved.id, shopId, isSuperAdmin);
  }

  async findAll(shopId: number | null, role?: UserRole, isSuperAdmin = false): Promise<Omit<User, "password">[]> {
    const where: any = {};
    if (!isSuperAdmin && shopId !== null) {
      where.shopId = shopId;
    }
    if (role) {
      where.role = role;
    }
    return await this.userRepository.find({
      where,
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number, shopId: number | null, isSuperAdmin = false): Promise<Omit<User, "password">> {
    const where: any = { id };
    if (!isSuperAdmin && shopId !== null) {
      where.shopId = shopId;
    }
    const user = await this.userRepository.findOne({ where });
    if (!user) {
      return null;
    }
    return user;
  }

  async findMe(userId: number): Promise<Omit<User, "password">> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      select: [
        "id",
        "name",
        "email",
        "password",
        "role",
        "shopId",
        "isActive",
        "commissionType",
        "commissionValue",
        "createdAt",
        "updatedAt",
      ],
    });
  }

  /** Usuários com role EMPLOYEE (para lavagens e dashboard) */
  async findEmployees(shopId: number): Promise<Omit<User, "password">[]> {
    return await this.userRepository.find({
      where: { role: UserRole.EMPLOYEE, shopId },
      order: { createdAt: "DESC" },
    });
  }

  async update(
    id: number,
    updateData: Partial<CreateUserDTO>,
    shopId: number | null,
    isSuperAdmin = false,
  ): Promise<Omit<User, "password">> {
    const where: any = { id };
    if (!isSuperAdmin && shopId !== null) {
      where.shopId = shopId;
    }
    const user = await this.userRepository.findOne({ where });
    if (!user) {
      return null;
    }
    const toUpdate = { ...updateData } as Record<string, unknown>;
    if (toUpdate.password) {
      toUpdate.password = await bcrypt.hash(toUpdate.password as string, 10);
    }
    if (updateData.role === UserRole.EMPLOYEE) {
      toUpdate.commissionType = updateData.commissionType ?? user.commissionType;
      toUpdate.commissionValue = updateData.commissionValue ?? user.commissionValue;
    } else {
      toUpdate.commissionType = null;
      toUpdate.commissionValue = null;
    }
    const updateWhere: any = { id };
    if (!isSuperAdmin && shopId !== null) {
      updateWhere.shopId = shopId;
    }
    await this.userRepository.update(updateWhere, toUpdate);
    return this.findOne(id, shopId, isSuperAdmin);
  }

  async remove(id: number, shopId: number | null, isSuperAdmin = false): Promise<void> {
    const where: any = { id };
    if (!isSuperAdmin && shopId !== null) {
      where.shopId = shopId;
    }
    await this.userRepository.softDelete(where);
  }
}

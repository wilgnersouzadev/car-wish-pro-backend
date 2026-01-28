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

  async create(createUserDTO: CreateUserDTO): Promise<Omit<User, "password">> {
    if (createUserDTO.role === UserRole.EMPLOYEE) {
      if (createUserDTO.commissionType == null || createUserDTO.commissionValue == null) {
        throw new BadRequestException("Funcionários devem ter tipo e valor de comissão");
      }
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
      commissionType: createUserDTO.role === UserRole.EMPLOYEE ? createUserDTO.commissionType : null,
      commissionValue: createUserDTO.role === UserRole.EMPLOYEE ? createUserDTO.commissionValue : null,
    };
    const user = this.userRepository.create(payload);
    const saved = await this.userRepository.save(user);
    return this.findOne(saved.id);
  }

  async findAll(): Promise<Omit<User, "password">[]> {
    return await this.userRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number): Promise<Omit<User, "password">> {
    const user = await this.userRepository.findOne({ where: { id } });
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
        "isActive",
        "commissionType",
        "commissionValue",
        "createdAt",
        "updatedAt",
      ],
    });
  }

  /** Usuários com role EMPLOYEE (para lavagens e dashboard) */
  async findEmployees(): Promise<Omit<User, "password">[]> {
    return await this.userRepository.find({
      where: { role: UserRole.EMPLOYEE },
      order: { createdAt: "DESC" },
    });
  }

  async update(
    id: number,
    updateData: Partial<CreateUserDTO>,
  ): Promise<Omit<User, "password">> {
    const user = await this.userRepository.findOne({ where: { id } });
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
    await this.userRepository.update(id, toUpdate);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.softDelete(id);
  }
}

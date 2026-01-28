import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { Shop } from "src/core/domain/entities/shop.entity";
import { User, UserRole } from "src/core/domain/entities/user.entity";
import { CreateShopDTO } from "src/presentation/dtos/shop/create-shop.dto";
import { RegisterOwnerDTO } from "src/presentation/dtos/shop/register-owner.dto";

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async registerOwner(registerOwnerDTO: RegisterOwnerDTO): Promise<{ shop: Shop; user: Omit<User, "password"> }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingShop = await this.shopRepository.findOne({
        where: [{ slug: registerOwnerDTO.shopSlug }],
      });

      if (existingShop) {
        throw new ConflictException("Já existe uma loja com este slug");
      }

      const existingUser = await this.userRepository.findOne({
        where: { email: registerOwnerDTO.ownerEmail },
      });

      if (existingUser) {
        throw new ConflictException("Já existe um usuário com este email");
      }

      const shop = this.shopRepository.create({
        name: registerOwnerDTO.shopName,
        slug: registerOwnerDTO.shopSlug,
      });

      const savedShop = await queryRunner.manager.save(shop);

      const hashedPassword = await bcrypt.hash(registerOwnerDTO.ownerPassword, 10);

      const owner = this.userRepository.create({
        name: registerOwnerDTO.ownerName,
        email: registerOwnerDTO.ownerEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        shopId: savedShop.id, // Contexto inicial
        isActive: true,
        shops: [savedShop], // Vincula o admin à loja via ManyToMany
      });

      const savedOwner = await queryRunner.manager.save(owner);

      await queryRunner.commitTransaction();

      const { password, ...ownerWithoutPassword } = savedOwner;
      return {
        shop: savedShop,
        user: ownerWithoutPassword,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async create(createShopDTO: CreateShopDTO, ownerId: number | null): Promise<Shop> {
    const existing = await this.shopRepository.findOne({
      where: { slug: createShopDTO.slug },
    });

    if (existing) {
      throw new ConflictException("Já existe uma loja com este slug");
    }

    const shop = this.shopRepository.create(createShopDTO);
    const savedShop = await this.shopRepository.save(shop);

    // Se ownerId é null, é super admin criando - não vincula a ninguém
    if (ownerId === null) {
      return savedShop;
    }

    // Se tem ownerId, é admin criando - vincula automaticamente
    const owner = await this.userRepository.findOne({
      where: { id: ownerId },
      relations: ["shops"],
    });

    if (!owner || owner.role !== UserRole.ADMIN) {
      throw new ConflictException("Apenas admins podem criar lojas");
    }

    // Vincula a loja ao admin
    if (!owner.shops) {
      owner.shops = [];
    }
    owner.shops.push(savedShop);
    // Se não tinha contexto, define esta como contexto atual
    if (!owner.shopId) {
      owner.shopId = savedShop.id;
    }
    await this.userRepository.save(owner);

    return savedShop;
  }

  async addShopToOwner(shopId: number, ownerId: number): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
    });

    if (!shop) {
      throw new ConflictException("Loja não encontrada");
    }

    const owner = await this.userRepository.findOne({
      where: { id: ownerId },
      relations: ["shops"],
    });

    if (!owner || owner.role !== UserRole.ADMIN) {
      throw new ConflictException("Apenas admins podem ser vinculados a lojas");
    }

    // Verifica se já está vinculado
    const alreadyLinked = owner.shops?.some((s) => s.id === shopId);
    if (alreadyLinked) {
      throw new ConflictException("Admin já está vinculado a esta loja");
    }

    // Vincula a loja ao admin
    if (!owner.shops) {
      owner.shops = [];
    }
    owner.shops.push(shop);
    await this.userRepository.save(owner);

    return shop;
  }

  async findAll(shopId?: number | null, userId?: number): Promise<Shop[]> {
    // Se passou shopId específico, retorna apenas essa loja
    if (shopId !== null && shopId !== undefined) {
      return await this.shopRepository.find({
        where: { id: shopId },
        order: { createdAt: "DESC" },
      });
    }

    // Se passou userId, retorna apenas as lojas desse admin
    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ["shops"],
      });
      return user?.shops || [];
    }

    // Caso contrário, retorna todas
    return await this.shopRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number): Promise<Shop> {
    return await this.shopRepository.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Shop> {
    return await this.shopRepository.findOne({ where: { slug } });
  }
}

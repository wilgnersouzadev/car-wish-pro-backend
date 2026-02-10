import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoyaltyProgram, RewardType } from "src/core/domain/entities/loyalty-program.entity";
import { LoyaltyCard } from "src/core/domain/entities/loyalty-card.entity";
import {
  LoyaltyTransaction,
  TransactionType,
} from "src/core/domain/entities/loyalty-transaction.entity";
import { Customer } from "src/core/domain/entities/customer.entity";

export interface CreateProgramDTO {
  name: string;
  washesRequired: number;
  rewardType: RewardType;
  rewardValue?: number;
}

export interface LoyaltyCardStatus {
  card: LoyaltyCard;
  program: LoyaltyProgram;
  currentPoints: number;
  washesRequired: number;
  progressPercentage: number;
  canRedeem: boolean;
  nextRewardIn: number;
}

export interface RedeemResult {
  success: boolean;
  rewardType: RewardType;
  rewardValue?: number;
  newPoints: number;
  transaction: LoyaltyTransaction;
}

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectRepository(LoyaltyProgram)
    private loyaltyProgramRepository: Repository<LoyaltyProgram>,
    @InjectRepository(LoyaltyCard)
    private loyaltyCardRepository: Repository<LoyaltyCard>,
    @InjectRepository(LoyaltyTransaction)
    private loyaltyTransactionRepository: Repository<LoyaltyTransaction>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async createProgram(shopId: number, config: CreateProgramDTO): Promise<LoyaltyProgram> {
    const existingActive = await this.loyaltyProgramRepository.findOne({
      where: { shopId, isActive: true },
    });

    if (existingActive) {
      throw new BadRequestException("Já existe um programa de fidelidade ativo para esta loja");
    }

    if (config.rewardType !== RewardType.FREE_WASH && !config.rewardValue) {
      throw new BadRequestException("Valor da recompensa é obrigatório para este tipo de recompensa");
    }

    const program = this.loyaltyProgramRepository.create({
      shopId,
      ...config,
    });

    return await this.loyaltyProgramRepository.save(program);
  }

  async updateProgram(
    programId: number,
    shopId: number,
    config: Partial<CreateProgramDTO>,
  ): Promise<LoyaltyProgram> {
    const program = await this.loyaltyProgramRepository.findOne({
      where: { id: programId, shopId },
    });

    if (!program) {
      throw new NotFoundException("Programa de fidelidade não encontrado");
    }

    Object.assign(program, config);
    return await this.loyaltyProgramRepository.save(program);
  }

  async toggleProgramStatus(programId: number, shopId: number): Promise<LoyaltyProgram> {
    const program = await this.loyaltyProgramRepository.findOne({
      where: { id: programId, shopId },
    });

    if (!program) {
      throw new NotFoundException("Programa de fidelidade não encontrado");
    }

    program.isActive = !program.isActive;
    return await this.loyaltyProgramRepository.save(program);
  }

  async getProgram(shopId: number): Promise<LoyaltyProgram | null> {
    return await this.loyaltyProgramRepository.findOne({
      where: { shopId, isActive: true },
    });
  }

  async getAllPrograms(shopId: number): Promise<LoyaltyProgram[]> {
    return await this.loyaltyProgramRepository.find({
      where: { shopId },
      order: { createdAt: "DESC" },
    });
  }

  async getOrCreateCard(customerId: number, shopId: number): Promise<LoyaltyCard> {
    const program = await this.getProgram(shopId);
    if (!program) {
      throw new BadRequestException("Nenhum programa de fidelidade ativo encontrado");
    }

    let card = await this.loyaltyCardRepository.findOne({
      where: { customerId, shopId },
      relations: ["loyaltyProgram", "customer"],
    });

    if (!card) {
      card = this.loyaltyCardRepository.create({
        customerId,
        shopId,
        loyaltyProgramId: program.id,
        currentPoints: 0,
        totalRewardsRedeemed: 0,
      });
      card = await this.loyaltyCardRepository.save(card);

      const customer = await this.customerRepository.findOne({ where: { id: customerId } });
      if (customer && !customer.isFrequentCustomer) {
        customer.isFrequentCustomer = true;
        await this.customerRepository.save(customer);
      }
    }

    return card;
  }

  async earnPoints(customerId: number, shopId: number, carWashId: number): Promise<LoyaltyCard> {
    const card = await this.getOrCreateCard(customerId, shopId);

    const transaction = this.loyaltyTransactionRepository.create({
      loyaltyCardId: card.id,
      carWashId,
      type: TransactionType.EARN,
      points: 1,
      description: "Ponto ganho por lavagem concluída",
    });

    await this.loyaltyTransactionRepository.save(transaction);

    card.currentPoints += 1;
    return await this.loyaltyCardRepository.save(card);
  }

  async redeemReward(customerId: number, shopId: number): Promise<RedeemResult> {
    const card = await this.loyaltyCardRepository.findOne({
      where: { customerId, shopId },
      relations: ["loyaltyProgram"],
    });

    if (!card) {
      throw new NotFoundException("Cartão de fidelidade não encontrado");
    }

    const program = card.loyaltyProgram;

    if (card.currentPoints < program.washesRequired) {
      throw new BadRequestException(
        `Pontos insuficientes. Necessário: ${program.washesRequired}, Atual: ${card.currentPoints}`,
      );
    }

    const transaction = this.loyaltyTransactionRepository.create({
      loyaltyCardId: card.id,
      type: TransactionType.REDEEM,
      points: program.washesRequired,
      description: `Recompensa resgatada: ${program.name}`,
    });

    await this.loyaltyTransactionRepository.save(transaction);

    card.currentPoints -= program.washesRequired;
    card.totalRewardsRedeemed += 1;
    await this.loyaltyCardRepository.save(card);

    return {
      success: true,
      rewardType: program.rewardType,
      rewardValue: program.rewardValue ? Number(program.rewardValue) : undefined,
      newPoints: card.currentPoints,
      transaction,
    };
  }

  async getCardStatus(customerId: number, shopId: number): Promise<LoyaltyCardStatus | null> {
    const card = await this.loyaltyCardRepository.findOne({
      where: { customerId, shopId },
      relations: ["loyaltyProgram", "customer"],
    });

    if (!card) {
      return null;
    }

    const program = card.loyaltyProgram;
    const progressPercentage = Math.min(
      100,
      Math.round((card.currentPoints / program.washesRequired) * 100),
    );
    const canRedeem = card.currentPoints >= program.washesRequired;
    const nextRewardIn = Math.max(0, program.washesRequired - card.currentPoints);

    return {
      card,
      program,
      currentPoints: card.currentPoints,
      washesRequired: program.washesRequired,
      progressPercentage,
      canRedeem,
      nextRewardIn,
    };
  }

  async getTransactions(cardId: number, shopId: number): Promise<LoyaltyTransaction[]> {
    const card = await this.loyaltyCardRepository.findOne({
      where: { id: cardId, shopId },
    });

    if (!card) {
      throw new NotFoundException("Cartão de fidelidade não encontrado");
    }

    return await this.loyaltyTransactionRepository.find({
      where: { loyaltyCardId: cardId },
      relations: ["carWash", "carWash.vehicle"],
      order: { createdAt: "DESC" },
    });
  }

  async getShopStats(shopId: number): Promise<{
    totalCustomersInProgram: number;
    totalRewardsRedeemed: number;
    totalPointsEarned: number;
    activeProgram: LoyaltyProgram | null;
  }> {
    const activeProgram = await this.getProgram(shopId);

    const cards = await this.loyaltyCardRepository.find({
      where: { shopId },
    });

    const totalCustomersInProgram = cards.length;
    const totalRewardsRedeemed = cards.reduce((sum, card) => sum + card.totalRewardsRedeemed, 0);

    const transactions = await this.loyaltyTransactionRepository.find({
      where: { type: TransactionType.EARN },
      relations: ["loyaltyCard"],
    });

    const totalPointsEarned = transactions.filter(
      (t) => cards.some((c) => c.id === t.loyaltyCardId),
    ).length;

    return {
      totalCustomersInProgram,
      totalRewardsRedeemed,
      totalPointsEarned,
      activeProgram,
    };
  }

  async getCustomersInProgram(shopId: number): Promise<Array<{
    customer: Customer;
    card: LoyaltyCard;
    status: LoyaltyCardStatus;
  }>> {
    const cards = await this.loyaltyCardRepository.find({
      where: { shopId },
      relations: ["customer", "loyaltyProgram"],
      order: { currentPoints: "DESC" },
    });

    const results = [];
    for (const card of cards) {
      const status = await this.getCardStatus(card.customerId, shopId);
      if (status) {
        results.push({
          customer: card.customer,
          card,
          status,
        });
      }
    }

    return results;
  }
}

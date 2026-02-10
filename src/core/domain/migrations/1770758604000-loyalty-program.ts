import { MigrationInterface, QueryRunner } from "typeorm";

export class LoyaltyProgram1770758604000 implements MigrationInterface {
  name = "LoyaltyProgram1770758604000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."loyalty_programs_rewardtype_enum" AS ENUM('free_wash', 'discount_percentage', 'discount_fixed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "loyalty_programs" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "shopId" integer NOT NULL,
        "name" character varying(255) NOT NULL,
        "washesRequired" integer NOT NULL,
        "rewardType" "public"."loyalty_programs_rewardtype_enum" NOT NULL,
        "rewardValue" numeric(10,2),
        "isActive" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_loyalty_programs" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "loyalty_cards" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "customerId" integer NOT NULL,
        "shopId" integer NOT NULL,
        "loyaltyProgramId" integer NOT NULL,
        "currentPoints" integer NOT NULL DEFAULT 0,
        "totalRewardsRedeemed" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_loyalty_cards" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."loyalty_transactions_type_enum" AS ENUM('earn', 'redeem')`,
    );
    await queryRunner.query(
      `CREATE TABLE "loyalty_transactions" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "loyaltyCardId" integer NOT NULL,
        "carWashId" integer,
        "type" "public"."loyalty_transactions_type_enum" NOT NULL,
        "points" integer NOT NULL,
        "description" text,
        CONSTRAINT "PK_loyalty_transactions" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_programs" ADD CONSTRAINT "FK_loyalty_programs_shop"
       FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_cards" ADD CONSTRAINT "FK_loyalty_cards_customer"
       FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_cards" ADD CONSTRAINT "FK_loyalty_cards_shop"
       FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_cards" ADD CONSTRAINT "FK_loyalty_cards_program"
       FOREIGN KEY ("loyaltyProgramId") REFERENCES "loyalty_programs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "FK_loyalty_transactions_card"
       FOREIGN KEY ("loyaltyCardId") REFERENCES "loyalty_cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "FK_loyalty_transactions_carwash"
       FOREIGN KEY ("carWashId") REFERENCES "car_washes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_loyalty_cards_customer_shop"
       ON "loyalty_cards" ("customerId", "shopId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_loyalty_cards_customer_shop"`);
    await queryRunner.query(`ALTER TABLE "loyalty_transactions" DROP CONSTRAINT "FK_loyalty_transactions_carwash"`);
    await queryRunner.query(`ALTER TABLE "loyalty_transactions" DROP CONSTRAINT "FK_loyalty_transactions_card"`);
    await queryRunner.query(`ALTER TABLE "loyalty_cards" DROP CONSTRAINT "FK_loyalty_cards_program"`);
    await queryRunner.query(`ALTER TABLE "loyalty_cards" DROP CONSTRAINT "FK_loyalty_cards_shop"`);
    await queryRunner.query(`ALTER TABLE "loyalty_cards" DROP CONSTRAINT "FK_loyalty_cards_customer"`);
    await queryRunner.query(`ALTER TABLE "loyalty_programs" DROP CONSTRAINT "FK_loyalty_programs_shop"`);
    await queryRunner.query(`DROP TABLE "loyalty_transactions"`);
    await queryRunner.query(`DROP TYPE "public"."loyalty_transactions_type_enum"`);
    await queryRunner.query(`DROP TABLE "loyalty_cards"`);
    await queryRunner.query(`DROP TABLE "loyalty_programs"`);
    await queryRunner.query(`DROP TYPE "public"."loyalty_programs_rewardtype_enum"`);
  }
}

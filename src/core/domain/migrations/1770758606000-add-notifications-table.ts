import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNotificationsTable1770758606000 implements MigrationInterface {
  name = "AddNotificationsTable1770758606000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('sms', 'whatsapp')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_status_enum" AS ENUM('sent', 'failed', 'pending')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_templatetype_enum" AS ENUM('wash_completed', 'reminder', 'appointment_confirmed', 'custom')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" (
        "id" SERIAL NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        "customerId" integer NOT NULL,
        "shopId" integer NOT NULL,
        "type" "public"."notifications_type_enum" NOT NULL,
        "status" "public"."notifications_status_enum" NOT NULL DEFAULT 'pending',
        "templateType" "public"."notifications_templatetype_enum" NOT NULL,
        "message" text NOT NULL,
        "recipientPhone" character varying(20) NOT NULL,
        "sentAt" TIMESTAMP,
        "errorMessage" text,
        "twilioMessageSid" text,
        CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_shop" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_customer" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_customer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_shop"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_templatetype_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
  }
}

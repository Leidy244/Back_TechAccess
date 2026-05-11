import { MigrationInterface, QueryRunner } from "typeorm";

export class AccesoV21778527283679 implements MigrationInterface {
    name = 'AccesoV21778527283679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accesos" DROP CONSTRAINT "FK_accesos_usuario"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_accesos_usuarioId"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_accesos_fecha"`);
        await queryRunner.query(`ALTER TABLE "accesos" DROP COLUMN "horaIngreso"`);
        await queryRunner.query(`ALTER TABLE "accesos" DROP COLUMN "horaSalida"`);
        await queryRunner.query(`ALTER TABLE "accesos" DROP COLUMN "fecha"`);
        await queryRunner.query(`ALTER TABLE "accesos" ADD "horaFecha" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "accesos" ADD "accion" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "accesos" ALTER COLUMN "usuarioId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "telephone" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "FamTelephone" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "state" SET DEFAULT 'activo'`);
        await queryRunner.query(`ALTER TABLE "accesos" ADD CONSTRAINT "FK_e993885e08b45e880466359a58f" FOREIGN KEY ("usuarioId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "accesos" DROP CONSTRAINT "FK_e993885e08b45e880466359a58f"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "state" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "FamTelephone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "telephone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "accesos" ALTER COLUMN "usuarioId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "accesos" DROP COLUMN "accion"`);
        await queryRunner.query(`ALTER TABLE "accesos" DROP COLUMN "horaFecha"`);
        await queryRunner.query(`ALTER TABLE "accesos" ADD "fecha" date NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "accesos" ADD "horaSalida" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "accesos" ADD "horaIngreso" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_accesos_fecha" ON "accesos" ("fecha") `);
        await queryRunner.query(`CREATE INDEX "IDX_accesos_usuarioId" ON "accesos" ("usuarioId") `);
        await queryRunner.query(`ALTER TABLE "accesos" ADD CONSTRAINT "FK_accesos_usuario" FOREIGN KEY ("usuarioId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

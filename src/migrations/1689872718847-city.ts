import {MigrationInterface, QueryRunner} from "typeorm"

export class City1689872718847 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "city"
            (
                "id"         SERIAL            NOT NULL,
                "name"       character varying NOT NULL,
                "population" integer           NOT NULL,
                CONSTRAINT "UQ_f8c0858628830a35f19efdc0ecf" UNIQUE ("name"),
                CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id")
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "city"`);
    }

}

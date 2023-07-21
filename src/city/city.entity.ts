import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
class City {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column({unique: true})
    public name: string;

    @Column()
    public population: number;
}

export default City;

import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import City from "../city/city.entity";

@Entity()
class Company {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column()
    public name: string;

    @Column()
    public population: number;

    @ManyToOne(() => City, (city) => city.id)
    @JoinColumn()
    public located: string;
}

export default Company;

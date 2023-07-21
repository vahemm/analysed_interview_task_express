import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import City from "../city/city.entity";

@Entity()
class Person {
    @PrimaryGeneratedColumn()
    public id: string;

    @Column()
    public first_name: string;

    @Column()
    public last_name: string;

    @Column()
    public age: number;

    @Column()
    public sex: string;

    @ManyToOne(() => City, (city) => city.id)
    @JoinColumn()
    public living: string;
}

export default Person;

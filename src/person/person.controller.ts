import * as express from 'express';
import {DataSource} from 'typeorm';
import Controller from '../interfaces/controller.interface';
import Person from './person.entity';
import validationMiddleware from "../middleware/validation.middleware";
import CreatePersonDto from "./dto/createPerson.dto";
import NodeAlreadyExistException from "../exceptions/NodeAlreadyExistException";
import CityNotFoundException from "../exceptions/CityNotFoundException";
import DeleteCityDto from "./dto/deleteCity.dto";
import City from "../city/city.entity";
import PersonNotFoundException from "../exceptions/PerosnNotFoundException";

class PersonController implements Controller {
    public path = '/person';
    public router = express.Router();
    private driver;
    private cityRepository;
    private personRepository;

    constructor(driver: any, AppDataSource: DataSource) {
        this.initializeRoutes();
        this.driver = driver;
        this.cityRepository = AppDataSource.getRepository(City);
        this.personRepository = AppDataSource.getRepository(Person);
    }

    private initializeRoutes() {
        this.router.post(this.path, validationMiddleware(CreatePersonDto), this.createPerson);
        this.router.get(this.path, this.getAllPersons);
        this.router.get(`${this.path}/:id`, this.getPersonById);
        this.router.put(`${this.path}/:id`, validationMiddleware(CreatePersonDto), this.updatePersonAddress);
        this.router.delete(`${this.path}/:id`, this.deletePerson);
    }

    private createPerson = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const personData = request.body;

        const city = await this.cityRepository.findOne({where: {name: personData.living}});
        if (!city) {
            next(new CityNotFoundException(personData.living));
        }

        const createNodeQuery = `
        MATCH (city:City {name: $living}) 
        CREATE (n:Person {
        first_name: $first_name, 
        last_name:$last_name,
        age:$age,
        sex: $sex
        }) -[:Living]-> (city) 
        RETURN n`;
        const ifExistNodeQuery = `MATCH (n:Person {first_name: $first_name, last_name: $last_name}) RETURN n`;
        const parameters = {
            first_name: personData.first_name,
            last_name: personData.last_name,
            age: personData.age,
            sex: personData.sex,
            living: personData.living
        };
        const session = this.driver.session();

        const isExistRes = await session.run(ifExistNodeQuery, parameters)

        if (isExistRes.records.length > 0) {
            console.error('Node already exist:');
            session.close();
            next(new NodeAlreadyExistException())
            return;
        }

        let newPerson: Person;
        await session
            .run(createNodeQuery, parameters)
            .then(async (result: any) => {
                newPerson = this.personRepository.create({
                    first_name: personData.first_name,
                    last_name: personData.last_name,
                    age: personData.age,
                    sex: personData.sex,
                    living: city.id
                });
                await this.personRepository.save(newPerson);
                result.records.forEach((record: any) => {
                    const createdNode = record.get('n');
                    console.log('Created node:', createdNode.properties);
                });
            })
            .catch((error: any) => {
                console.error('Error creating node:', error);
            })
            .finally(() => {
                session.close();
                response.send(newPerson);
            });

    }

    private getAllPersons = async (request: express.Request, response: express.Response) => {
        const person = await this.personRepository.find();

        response.json({
            status: 'ok',
            persons: person
        });
    }

    private getPersonById = async (request: any, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;
        const person = await this.personRepository.findOne({where: {id}});
        if (person) {
            response.send(person);
        } else {
            next(new PersonNotFoundException(id));
        }
    }

    private updatePersonAddress = async (request: any, response: express.Response, next: express.NextFunction) => {
        const body = request.body;
        const id = request.params.id;


        const updateNodeQuery = `MATCH (city:City {name: $living})
        MATCH (person:Person {first_name: $first_name, last_name: $last_name})-[r1:Living]->() 
        CREATE (person)-[r2:Living]->(city)       
        DELETE r1
        RETURN person`;
        const parameters = {
            first_name: body.first_name,
            last_name: body.last_name,
            age: body.age,
            sex: body.sex,
            living: body.living
        };
        const session = this.driver.session();

        const updateRes = await session.run(updateNodeQuery, parameters);

        if (updateRes.records.length > 0) {
            session.close();
            const city = await this.cityRepository.findOne({where: {name: body.living}});
            if (!city) {
                next(new CityNotFoundException(body.living));
            }

            await this.personRepository.createQueryBuilder()
                .update(Person)
                .set({living: city.id})
                .where("id = :id", {id})
                .execute();
        }
        response.sendStatus(200);
    }

    private deletePerson = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;

        const person = await this.personRepository.findOne({where: {id}});
        if (!person) {
            next(new CityNotFoundException(person.id));
        }


        const deleteNodeQuery = `MATCH(person:Person {first_name: $first_name, last_name: $last_name})
         WITH person, person.first_name AS first_name
         DETACH DELETE person
         RETURN first_name`;
        const parameters = {
            first_name: person.first_name,
            last_name: person.last_name,
        };
        const session = this.driver.session();

        const deleteRes = await session.run(deleteNodeQuery, parameters);

        if (deleteRes.records.length > 0) {
            session.close();
            await this.personRepository.delete({id});
        }
        response.sendStatus(204);
    }

}

export default PersonController;

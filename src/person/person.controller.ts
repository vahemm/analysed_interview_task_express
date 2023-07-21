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
        this.router.put(`${this.path}/:id`, validationMiddleware(CreatePersonDto), this.updatePerson);
        this.router.delete(`${this.path}/:id`, this.deletePerson);
    }

    private createPerson = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const personData = request.body;

        const city = await this.cityRepository.findOne({where: {name: personData.living}});
        if (!city) {
            next(new CityNotFoundException(personData.living));
        }

        const createNodeQuery = `CREATE (n:Person {name: $name, population:$population}) RETURN n`;
        const ifExistNodeQuery = `MATCH (n:Person {name: $name}) RETURN n`;
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

    private updatePerson = async (request: any, response: express.Response, next: express.NextFunction) => {
        const body = request.body;
        const id = request.params.id;


        const updateNodeQuery = `MATCH (city:City {name: $name}) 
        SET city.population = $population
        RETURN city`;
        const parameters = {
            name: body.name,
            population: body.population,
        };
        const session = this.driver.session();

        const updateRes = await session.run(updateNodeQuery, parameters);

        if (updateRes.records.length > 0) {
            session.close();
            await this.cityRepository.createQueryBuilder()
                .update(Person)
                .set({
                    ...body
                })
                .where("id = :id", {id})
                .execute();
        }
        response.sendStatus(200);
    }

    private deletePerson = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;

        const deleteNodeQuery = `MATCH(city:City {name: $name})
         WITH city, city.name AS name
         DETACH DELETE city
         RETURN name`;
        const parameters = {
            name,
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

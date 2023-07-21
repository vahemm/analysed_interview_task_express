import * as express from 'express';
import {DataSource} from 'typeorm';
import Controller from '../interfaces/controller.interface';
import City from './city.entity';
import validationMiddleware from "../middleware/validation.middleware";
import CreateCityDto from "./dto/createCity.dto";
import NodeAlreadyExistException from "../exceptions/NodeAlreadyExistException";
import CityNotFoundException from "../exceptions/CityNotFoundException";
import DeleteCityDto from "./dto/deleteCity.dto";

class CityController implements Controller {
    public path = '/city';
    public router = express.Router();
    private driver;
    private cityRepository;

    constructor(driver: any, AppDataSource: DataSource) {
        this.initializeRoutes();
        this.driver = driver;
        this.cityRepository = AppDataSource.getRepository(City);
    }

    private initializeRoutes() {
        this.router.post(this.path, validationMiddleware(CreateCityDto), this.createCity);
        this.router.get(this.path, this.getAllCities);
        this.router.get(`${this.path}/:id`, this.getCityById);
        this.router.put(this.path, validationMiddleware(CreateCityDto), this.updateCity);
        this.router.delete(this.path, validationMiddleware(DeleteCityDto), this.deleteCity);
    }

    private createCity = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        const cityData = request.body;
        const createNodeQuery = `CREATE (n:City {name: $name, population:$population}) RETURN n`;
        const ifExistNodeQuery = `MATCH (n:City {name: $name}) RETURN n`;
        const parameters = {
            name: cityData.name,
            population: cityData.population,
        };
        const session = this.driver.session();

        const isExistRes = await session.run(ifExistNodeQuery, parameters)

        if (isExistRes.records.length > 0) {
            console.error('Node already exist:');
            session.close();
            next(new NodeAlreadyExistException())
            return;
        }

        let newCity: City;
        await session
            .run(createNodeQuery, parameters)
            .then(async (result: any) => {
                newCity = this.cityRepository.create({name: cityData.name, population: cityData.population});
                await this.cityRepository.save(newCity);
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
                response.send(newCity);
            });

    }

    private getAllCities = async (request: express.Request, response: express.Response) => {
        const city = await this.cityRepository.find();

        response.json({
            status: 'ok',
            cities: city
        });
    }

    private getCityById = async (request: any, response: express.Response, next: express.NextFunction) => {
        const id = request.params.id;
        const city = await this.cityRepository.findOne({where: {id}});
        if (city) {
            response.send(city);
        } else {
            next(new CityNotFoundException(id));
        }
    }

    private updateCity = async (request: any, response: express.Response, next: express.NextFunction) => {
        const body = request.body;

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
                .update(City)
                .set({population: body.population})
                .where("name = :name", {name: body.name})
                .execute();
        }
        response.sendStatus(200);
    }

    private deleteCity = async (request: any, response: express.Response, next: express.NextFunction) => {
        const name = request.body.name as string;

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
            await this.cityRepository.delete({name});
        }
        response.sendStatus(204);
    }

}

export default CityController;

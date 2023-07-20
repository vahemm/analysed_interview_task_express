import * as express from 'express';
import { getRepository } from 'typeorm';
import CategoryNotFoundException from '../exceptions/CategoryNotFoundException';
import Controller from '../interfaces/controller.interface';
import validationMiddleware from '../middleware/validation.middleware';
import CreateCategoryDto from './category.dto';
import Category from './category.entity';

class CategoryController implements Controller {
  public path = '/categories';
  public router = express.Router();
  private driver;
  private categoryRepository = getRepository(Category);

  constructor(driver:any) {
    this.initializeRoutes();
    this.driver = driver;
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllCategories);
    this.router.get(`${this.path}/:id`, this.getCategoryById);
    this.router.post(this.path, this.createCategory);
  }
  private getAllCategories = async (request: express.Request, response:express.Response) => {
      console.log('test')
    const categories = await this.categoryRepository.find();
    const    session = this.driver.session();
    session
        .run('MATCH (n:Categories) RETURN n LIMIT 25')
        .then((result:any) => {
          // tslint:disable-next-line:ter-arrow-parens
          const  nodes = result.records.map((record:any) => record.get('n').properties);
          console.log(nodes);
        })
        .catch((error:any) => {
          console.error('Error retrieving nodes:', error);
          // response.status(500).send('Error retrieving nodes');
        })
        .finally(() => {
          session.close();
        });

    response.json({

      status:'ok',
      category : categories});
  }

  private getCategoryById = async (request:any, response: express.Response, next: express.NextFunction) => {
    const id = request.params.id;
    const category = await this.categoryRepository.findOne(id);
    if (category) {
      response.send(category);
    } else {
      next(new CategoryNotFoundException(id));
    }
  }

  private createCategory = async (request:express.Request, response:express.Response) => {
    const categoryData = request.body;
    console.log(categoryData)
      const createNodeQuery = `
  CREATE (n:Categories {name: $name})
  RETURN n
`;
      const parameters = {
          name: 'Happy',
      };
    const    session = this.driver.session();
    session
        .run(createNodeQuery,parameters)
        .then((result:any) => {
          result.records.forEach((record:any) => {
            const createdNode = record.get('n');
            console.log('Created node:', createdNode.properties);
          });
            })
        .catch((error:any) => {
          console.error('Error creating node:', error);
        })
        .finally(() => {
          session.close();
          this.driver.close();
        });
    const newCategory = this.categoryRepository.create({ name:'Happy' });
    await this.categoryRepository.save(newCategory);
    response.send(newCategory);
  }
}

export default CategoryController;

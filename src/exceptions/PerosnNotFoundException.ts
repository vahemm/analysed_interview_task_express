import HttpException from './HttpException';

class PersonNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Person with id ${id} not found`);
    }
}

export default PersonNotFoundException;

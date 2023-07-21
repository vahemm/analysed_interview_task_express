import HttpException from './HttpException';

class CityNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `City with id ${id} not found`);
    }
}

export default CityNotFoundException;

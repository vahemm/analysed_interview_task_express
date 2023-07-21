import HttpException from './HttpException';

class NodeAlreadyExistException extends HttpException {
    constructor() {
        super(403, `Node already exist`);
    }
}

export default NodeAlreadyExistException;

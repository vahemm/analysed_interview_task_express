import {IsNumber, IsString} from 'class-validator';

class DeleteCityDto {
    @IsString()
    public name: string;
}

export default DeleteCityDto;

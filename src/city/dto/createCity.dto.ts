import {IsNumber, IsString} from 'class-validator';

class CreateCityDto {
    @IsString()
    public name: string;

    @IsNumber()
    public population: number;
}

export default CreateCityDto;

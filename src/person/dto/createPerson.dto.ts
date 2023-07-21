import {IsEnum, IsNumber, IsString} from 'class-validator';


enum PersonSex {
    male = "male",
    female = "female"
};

class CreatePersonDto {
    @IsString()
    first_name: string;

    @IsString()
    last_name: string;

    @IsNumber()
    age: string;

    @IsString()
    @IsEnum(PersonSex)
    sex: string;

    @IsString()
    public living: string;
}

export default CreatePersonDto;

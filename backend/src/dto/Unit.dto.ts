import {IsNotEmpty, IsString, MaxLength} from "class-validator";

export class CreateUnitRequest {
    @IsString()
    @IsNotEmpty()
    @MaxLength(60, {message:"name of unit must not be greater than 60 characters"})
    name!:string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10, {message:"symbol of unit must not be greater than 10 characters"})
    symbol!:string;

}

export class UpdateUnitRequest extends CreateUnitRequest {}
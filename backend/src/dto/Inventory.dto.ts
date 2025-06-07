import {
    IsNotEmpty,
    IsString,
    IsOptional,
    MaxLength,
    IsEmail,
    IsInt,
    Min,
    IsNumber,
    IsIn,
    IsDate
} from "class-validator";
import {Type} from "class-transformer";

export class AddProductContractRequest {

    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    productId!:number


    @IsInt()
    @Min(0, {message:"id must be greater or equal than 0"})
    contractId!:number

    @IsOptional()
    @IsString({ message: 'Note must be a string' })
    @MaxLength(1000, { message: 'Note must be shorter than or equal to 1000 characters' })
    note?: string;

    @IsNumber()
    @Min(0, {message:"id must be greater or equal than 0"})
    contractQuantity!:number

}


export class UpdateProductInventoryRequest {


    @IsOptional()
    @IsString({ message: 'Note must be a string' })
    @MaxLength(1000, { message: 'Note must be shorter than or equal to 1000 characters' })
    note?: string;

    @IsNumber()
    @Min(0, {message:"id must be greater or equal than 0"})
    contractQuantity!:number

}

export class AddInventorySessionRequest {

    @Type(() => Date)
    @IsDate()
    giveDate!: Date;

    @IsNumber()
    @Min(0, {message:"id must be greater or equal than 0"})
    amount!:number

    @IsNotEmpty({ message: 'Type is required' })
    @IsIn(['issued', 'refund'], {
        message: 'Type must be either "issued", "canceled" or "refund"'
    })
    type!: 'issued' | 'refund';


}
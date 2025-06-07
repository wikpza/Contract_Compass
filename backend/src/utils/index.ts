import {registerDecorator, ValidationArguments, ValidationOptions} from "class-validator";
import { v4 as uuidv4 } from 'uuid';

export function IsPositiveNonZero(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isPositiveNonZero',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return typeof value === 'number' && value > 0;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a number greater than 0`;
                }
            },
        });
    };
}


export const getFileCode=  ():string=>{
    return uuidv4()
}
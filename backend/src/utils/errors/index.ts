import {validate} from "class-validator";
import {BaseError, ConflictError} from "../error";

export const ValidatorError = async(input:any): Promise<Record<string, any> | false> => {
    const error = await validate(input, {
        ValidatorError:{target:true, property:true}
    })
    if(error.length){
        return error.map((err)=>({
            field:err.property,
            message:
                (err.constraints && Object.values(err.constraints)[0]) ||
                'please provide input for this field',
        }))
    }
    return false
}


function parseInteger(input: string): number | null {
    const parsed = parseInt(input, 10);
    if (isNaN(parsed)) {
        console.log('Строка не является числом');
        return null;  // Возвращаем null, если строка не является числом
    }
    return parsed;  // Возвращаем целое число
}


export const checkSQLErrorMessage = (message:string) =>{
    const parsedMessage = message.split('/')
    if(parsedMessage.length === 3 ){
        const errorCode =  parseInteger(parsedMessage[0])
        if(errorCode){
            throw new BaseError("SQL_ERROR",errorCode, parsedMessage[2],{[parsedMessage[1]]:[parsedMessage[2]]} )
        }
    }
    throw new BaseError("Internal SQL error", 500,"Internal SQL error" )

}
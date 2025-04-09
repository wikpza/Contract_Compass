import { plainToClass } from "class-transformer";
import { ValidationError, validate } from "class-validator";

// Функция для валидации
const validationError = async (input: any): Promise<ValidationError[] | false> => {
    const errors = await validate(input, {
        validationError: { target: true },
    });

    if (errors.length) {
        return errors;
    }

    return false;
};

// Тип для словаря с ошибками
type StringArrayDictionary = {
    [key: string]: string[];
};

// Основная функция валидатора
export const RequestValidator = async <T>(
    type: new () => T, // Тип конструктора, который создает экземпляры класса
    body: any
): Promise<{ errors: boolean | StringArrayDictionary; input: T }> => {
    const input = plainToClass(type, body); // Преобразуем объект в экземпляр класса

    const errors = await validationError(input);

    if (errors) {
        const errorMessage: StringArrayDictionary = {};
        errors.forEach((error: ValidationError) => {
            if (!errorMessage[error.property]) errorMessage[error.property] = [];
            if (error.constraints) {
                errorMessage[error.property].push(...Object.values(error.constraints)); // Проверяем, что constraints определён
            }
        });

        return { errors: errorMessage, input };
    }

    return { errors: false, input };
};

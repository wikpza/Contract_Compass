import { STATUS_CODES } from "./status-codes";

export class BaseError extends Error {
    public readonly name: string;
    public readonly status: number;
    public readonly message: string;
    public readonly details?: any; // Поле для JSON-объекта или массива

    constructor(name: string, status: number, description: string, details?: any) {
        super(description);
        this.name = name;
        this.status = status;
        this.message = description;
        this.details = details; // Дополнительные данные об ошибке
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }

    toJSON() {
        // Метод для представления ошибки в формате JSON
        return {
            name: this.name,
            status: this.status,
            message: this.message,
            details: this.details,
        };
    }
}


// 500 Internal Error
export class APIError extends BaseError {
    constructor(description = "api error") {
        super(
            "api internal server error",
            STATUS_CODES.INTERNAL_ERROR,
            description
        );
    }
}

// 400 Validation Error
export class ValidationError extends BaseError {
    constructor(description = "bad request", details?:any) {
        super("NotFoundError", STATUS_CODES.BAD_REQUEST, description, details);
    }
}

// 403 Authorize error
export class AuthorizeError extends BaseError {
    constructor(description = "access denied", details?:any) {
        super("access denied", STATUS_CODES.UN_AUTHORISED, description, details);
    }
}

// 404 Not Found
export class NotFoundError extends BaseError {
    constructor(description = "not found", details?:any) {
        super(description, STATUS_CODES.NOT_FOUND, description, details);
    }
}

export class ConflictError extends BaseError {
    constructor(description = " Data conflict",  details?:any) {
        super(description, STATUS_CODES.CONFLICT_ERROR, description, details);
    }
}

type FormErrors = {
    [key: string]: string[][];
};

const errors: any = {
    email: [
        ["email must be an email"]
    ]
};

function isFormErrors(obj: any): obj is FormErrors {
    // Проверка на соответствие типу
    return typeof obj === 'object' && obj !== null && Object.keys(obj).every(key =>
        Array.isArray(obj[key]) && obj[key].every(item => Array.isArray(item) && item.every(subItem => typeof subItem === 'string'))
    );
}

if (isFormErrors(errors)) {
    console.log("Object matches the FormErrors type");
} else {
    console.log("Object does not match the FormErrors type");
}

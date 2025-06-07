"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.NotFoundError = exports.AuthorizeError = exports.ValidationError = exports.APIError = exports.BaseError = void 0;
const status_codes_1 = require("./status-codes");
class BaseError extends Error {
    constructor(name, status, description, details) {
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
exports.BaseError = BaseError;
// 500 Internal Error
class APIError extends BaseError {
    constructor(description = "api error") {
        super("api internal server error", status_codes_1.STATUS_CODES.INTERNAL_ERROR, description);
    }
}
exports.APIError = APIError;
// 400 Validation Error
class ValidationError extends BaseError {
    constructor(description = "bad request", details) {
        super("NotFoundError", status_codes_1.STATUS_CODES.BAD_REQUEST, description, details);
    }
}
exports.ValidationError = ValidationError;
// 403 Authorize error
class AuthorizeError extends BaseError {
    constructor(description = "access denied", details) {
        super("access denied", status_codes_1.STATUS_CODES.UN_AUTHORISED, description, details);
    }
}
exports.AuthorizeError = AuthorizeError;
// 404 Not Found
class NotFoundError extends BaseError {
    constructor(description = "not found", details) {
        super(description, status_codes_1.STATUS_CODES.NOT_FOUND, description, details);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends BaseError {
    constructor(description = " Data conflict", details) {
        super(description, status_codes_1.STATUS_CODES.CONFLICT_ERROR, description, details);
    }
}
exports.ConflictError = ConflictError;
const errors = {
    email: [
        ["email must be an email"]
    ]
};
function isFormErrors(obj) {
    // Проверка на соответствие типу
    return typeof obj === 'object' && obj !== null && Object.keys(obj).every(key => Array.isArray(obj[key]) && obj[key].every(item => Array.isArray(item) && item.every(subItem => typeof subItem === 'string')));
}
if (isFormErrors(errors)) {
    console.log("Object matches the FormErrors type");
}
else {
    console.log("Object does not match the FormErrors type");
}

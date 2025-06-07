"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSQLErrorMessage = exports.ValidatorError = void 0;
const class_validator_1 = require("class-validator");
const error_1 = require("../error");
const ValidatorError = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const error = yield (0, class_validator_1.validate)(input, {
        ValidatorError: { target: true, property: true }
    });
    if (error.length) {
        return error.map((err) => ({
            field: err.property,
            message: (err.constraints && Object.values(err.constraints)[0]) ||
                'please provide input for this field',
        }));
    }
    return false;
});
exports.ValidatorError = ValidatorError;
function parseInteger(input) {
    const parsed = parseInt(input, 10);
    if (isNaN(parsed)) {
        console.log('Строка не является числом');
        return null; // Возвращаем null, если строка не является числом
    }
    return parsed; // Возвращаем целое число
}
const checkSQLErrorMessage = (message) => {
    const parsedMessage = message.split('/');
    if (parsedMessage.length === 3) {
        const errorCode = parseInteger(parsedMessage[0]);
        if (errorCode) {
            throw new error_1.BaseError("SQL_ERROR", errorCode, parsedMessage[2], { [parsedMessage[1]]: [parsedMessage[2]] });
        }
    }
    throw new error_1.BaseError("Internal SQL error", 500, "Internal SQL error");
};
exports.checkSQLErrorMessage = checkSQLErrorMessage;

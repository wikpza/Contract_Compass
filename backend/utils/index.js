"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileCode = void 0;
exports.IsPositiveNonZero = IsPositiveNonZero;
const class_validator_1 = require("class-validator");
const uuid_1 = require("uuid");
function IsPositiveNonZero(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isPositiveNonZero',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    return typeof value === 'number' && value > 0;
                },
                defaultMessage(args) {
                    return `${args.property} must be a number greater than 0`;
                }
            },
        });
    };
}
const getFileCode = () => {
    return (0, uuid_1.v4)();
};
exports.getFileCode = getFileCode;

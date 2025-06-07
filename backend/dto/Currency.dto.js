"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCurrencyRequest = exports.CreateCurrencyRequest = void 0;
const class_validator_1 = require("class-validator");
class CreateCurrencyRequest {
}
exports.CreateCurrencyRequest = CreateCurrencyRequest;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(60, { message: "name of unit must not be greater than 60 characters" }),
    __metadata("design:type", String)
], CreateCurrencyRequest.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Length)(1, 1, { message: "symbol must not be only 1 character" }),
    __metadata("design:type", String)
], CreateCurrencyRequest.prototype, "symbol", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUppercase)(),
    (0, class_validator_1.Length)(3, 3, { message: "symbol must not be only 3 characters" }),
    __metadata("design:type", String)
], CreateCurrencyRequest.prototype, "code", void 0);
class UpdateCurrencyRequest extends CreateCurrencyRequest {
}
exports.UpdateCurrencyRequest = UpdateCurrencyRequest;

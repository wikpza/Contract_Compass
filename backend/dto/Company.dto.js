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
exports.UpdateCompanyRequest = exports.CreateCompanyRequest = void 0;
const class_validator_1 = require("class-validator");
class CreateCompanyRequest {
}
exports.CreateCompanyRequest = CreateCompanyRequest;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Name is required' }),
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name must be shorter than or equal to 100 characters' }),
    __metadata("design:type", String)
], CreateCompanyRequest.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Please enter a valid email address' }),
    (0, class_validator_1.MaxLength)(255, { message: 'Email must be shorter than or equal to 255 characters' }),
    __metadata("design:type", String)
], CreateCompanyRequest.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Phone must be a string' }),
    (0, class_validator_1.MaxLength)(20, { message: 'Phone must be shorter than or equal to 20 characters' }),
    __metadata("design:type", String)
], CreateCompanyRequest.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Address must be a string' }),
    (0, class_validator_1.MaxLength)(500, { message: 'Address must be shorter than or equal to 500 characters' }),
    __metadata("design:type", String)
], CreateCompanyRequest.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Note must be a string' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Note must be shorter than or equal to 1000 characters' }),
    __metadata("design:type", String)
], CreateCompanyRequest.prototype, "note", void 0);
class UpdateCompanyRequest extends CreateCompanyRequest {
}
exports.UpdateCompanyRequest = UpdateCompanyRequest;

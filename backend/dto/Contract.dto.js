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
exports.UpdateStatusContractRequest = exports.CreateContractRequest = exports.UpdateContractRequest = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const utils_1 = require("../utils");
class UpdateContractRequest {
}
exports.UpdateContractRequest = UpdateContractRequest;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Type is required' }),
    (0, class_validator_1.IsIn)(['product', 'service'], {
        message: 'Type must be either "product" or "service"'
    }),
    __metadata("design:type", String)
], UpdateContractRequest.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Name is required' }),
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name must be shorter than or equal to 100 characters' }),
    __metadata("design:type", String)
], UpdateContractRequest.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], UpdateContractRequest.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], UpdateContractRequest.prototype, "applicantId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], UpdateContractRequest.prototype, "purchaserId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], UpdateContractRequest.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], UpdateContractRequest.prototype, "currencyId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], UpdateContractRequest.prototype, "amount", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateContractRequest.prototype, "signDate", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateContractRequest.prototype, "officialBeginDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], UpdateContractRequest.prototype, "officialFinishDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, utils_1.IsPositiveNonZero)({ message: "value must be greater than 0" }),
    __metadata("design:type", Number)
], UpdateContractRequest.prototype, "projectCurrencyExchangeRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Note must be a string' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Note must be shorter than or equal to 1000 characters' }),
    __metadata("design:type", String)
], UpdateContractRequest.prototype, "note", void 0);
class CreateContractRequest extends UpdateContractRequest {
}
exports.CreateContractRequest = CreateContractRequest;
class UpdateStatusContractRequest {
}
exports.UpdateStatusContractRequest = UpdateStatusContractRequest;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Status is required' }),
    (0, class_validator_1.IsIn)(["active", "completed", 'canceled'], {
        message: 'Status must be either "cancel" or "active"'
    }),
    __metadata("design:type", String)
], UpdateStatusContractRequest.prototype, "status", void 0);

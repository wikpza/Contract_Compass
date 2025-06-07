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
exports.AddInventorySessionRequest = exports.UpdateProductInventoryRequest = exports.AddProductContractRequest = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class AddProductContractRequest {
}
exports.AddProductContractRequest = AddProductContractRequest;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], AddProductContractRequest.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], AddProductContractRequest.prototype, "contractId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Note must be a string' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Note must be shorter than or equal to 1000 characters' }),
    __metadata("design:type", String)
], AddProductContractRequest.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], AddProductContractRequest.prototype, "contractQuantity", void 0);
class UpdateProductInventoryRequest {
}
exports.UpdateProductInventoryRequest = UpdateProductInventoryRequest;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Note must be a string' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Note must be shorter than or equal to 1000 characters' }),
    __metadata("design:type", String)
], UpdateProductInventoryRequest.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], UpdateProductInventoryRequest.prototype, "contractQuantity", void 0);
class AddInventorySessionRequest {
}
exports.AddInventorySessionRequest = AddInventorySessionRequest;
__decorate([
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], AddInventorySessionRequest.prototype, "giveDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], AddInventorySessionRequest.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Type is required' }),
    (0, class_validator_1.IsIn)(['issued', 'refund'], {
        message: 'Type must be either "issued", "canceled" or "refund"'
    }),
    __metadata("design:type", String)
], AddInventorySessionRequest.prototype, "type", void 0);

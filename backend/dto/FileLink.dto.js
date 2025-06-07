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
exports.UpdateFileLinkRequest = exports.CreateFileLinkRequest = void 0;
const class_validator_1 = require("class-validator");
class CreateFileLinkRequest {
}
exports.CreateFileLinkRequest = CreateFileLinkRequest;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Name is required' }),
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name must be shorter than or equal to 100 characters' }),
    __metadata("design:type", String)
], CreateFileLinkRequest.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Note must be a string' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'Note must be shorter than or equal to 1000 characters' }),
    __metadata("design:type", String)
], CreateFileLinkRequest.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], CreateFileLinkRequest.prototype, "contractId", void 0);
class UpdateFileLinkRequest extends CreateFileLinkRequest {
}
exports.UpdateFileLinkRequest = UpdateFileLinkRequest;

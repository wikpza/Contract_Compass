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
exports.UpdateFileRequest = exports.AddFileRequest = void 0;
require("reflect-metadata"); // 👈 Должно быть ПЕРВЫМ импортом
const class_validator_1 = require("class-validator");
class AddFileRequest {
}
exports.AddFileRequest = AddFileRequest;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0, { message: "id must be greater or equal than 0" }),
    __metadata("design:type", Number)
], AddFileRequest.prototype, "contractId", void 0);
class UpdateFileRequest {
}
exports.UpdateFileRequest = UpdateFileRequest;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Name is required' }),
    (0, class_validator_1.IsString)({ message: 'Name must be a string' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Name must be shorter than or equal to 100 characters' }),
    __metadata("design:type", String)
], UpdateFileRequest.prototype, "name", void 0);

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLinkRepository = void 0;
const models_1 = require("../database/models");
const error_1 = require("../utils/error");
const database_1 = __importDefault(require("../database"));
const sequelize_1 = require("sequelize");
class FileLinkRepository {
    createFileLink(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const contractExist = yield models_1.Contract.findOne({ where: { id: input.contractId } });
            if (!contractExist)
                throw new error_1.NotFoundError('contractId', { contract: ['Не удалось найти контракт'] });
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            const nameExist = yield models_1.FileLink.findOne({ where: { name: input.name, contractId: input.contractId } });
            if (nameExist)
                throw new error_1.ConflictError('name', { name: ['Данное имя уже занято'] });
            return yield models_1.FileLink.create({
                url: input.url,
                name: input.name,
                contractId: input.contractId
            });
        });
    }
    deleteFileLink(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield database_1.default.transaction();
            // 1. Проверяем существование заявителя
            const fileLink = yield models_1.FileLink.findOne({
                where: { id: input.id },
                transaction
            });
            if (!fileLink) {
                throw new error_1.NotFoundError('Не найдена ссылка', { 'id': ["Не найдена ссылка"] });
            }
            const contractExist = yield models_1.Contract.findOne({ where: { id: fileLink.contractId } });
            if (!contractExist)
                throw new error_1.NotFoundError('Не удалось найти Файл');
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            // 3. Удаляем заявителя
            yield fileLink.destroy({ transaction });
            // 4. Проверяем, что запись действительно удалена
            const verifyDeletion = yield models_1.Applicant.findOne({
                where: { id: input.id },
                transaction
            });
            if (verifyDeletion) {
                throw new Error('Не удалось удалить ссылку');
            }
            yield transaction.commit();
            return fileLink;
        });
    }
    getFileLink(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchBy, searchValue, page = 1, limit = 10, sortBy = 'createdAt', sortType = 'ASC', contractId } = input;
            try {
                const offset = (page - 1) * limit;
                // Создаем базовые условия запроса
                const where = {
                    contractId: contractId
                };
                // Добавляем условия поиска, если они указаны
                if (searchBy && searchValue) {
                    if (Array.isArray(searchBy)) {
                        // Если searchBy - массив, ищем по нескольким полям
                        where[sequelize_1.Op.or] = searchBy.map(field => ({
                            [field]: { [sequelize_1.Op.like]: `%${searchValue}%` }
                        }));
                    }
                    else {
                        // Если searchBy - строка, ищем по одному полю
                        where[searchBy] = { [sequelize_1.Op.like]: `%${searchValue}%` };
                    }
                }
                // Выполняем запрос
                const result = yield models_1.FileLink.findAndCountAll({
                    where,
                    order: [[sortBy, sortType]],
                    limit,
                    offset,
                    // Для MSSQL нужно добавить distinct: true при использовании findAndCountAll с limit/offset
                    distinct: true
                });
                return {
                    rows: result.rows,
                    count: result.count
                };
            }
            catch (error) {
                console.error('Error fetching units:', error);
                throw error;
            }
        });
    }
    updateFileLink(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileExist = yield models_1.FileLink.findOne({ where: { id: input.id } });
            if (!fileExist)
                throw new error_1.NotFoundError('Не удалось найти ссылку');
            const contractExist = yield models_1.Contract.findOne({ where: { id: fileExist.contractId } });
            if (!contractExist)
                throw new error_1.NotFoundError('Не удалось найти Файл');
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            if (fileExist.name === input.name && fileExist.url === input.url)
                throw new error_1.ConflictError('Вы ничего не изменили');
            if (input.name !== fileExist.name) {
                const existName = yield models_1.FileLink.findOne({ where: { name: input.name, contractId: fileExist.contractId } });
                if (existName)
                    throw new error_1.ConflictError('name', { name: ['Данное имя уже занято'] });
                fileExist.name = input.name;
            }
            if (input.url !== fileExist.url) {
                fileExist.url = input.url;
            }
            yield fileExist.save();
            return fileExist;
        });
    }
}
exports.FileLinkRepository = FileLinkRepository;

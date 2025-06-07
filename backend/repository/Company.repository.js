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
exports.CompanyRepository = void 0;
const models_1 = require("../database/models");
const sequelize_1 = require("sequelize");
const error_1 = require("../utils/error");
const database_1 = __importDefault(require("../database"));
class CompanyRepository {
    createCompany(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const nameExist = yield models_1.Company.findOne({ where: { name: input.name } });
            if (nameExist)
                throw new error_1.ConflictError('name', { name: ['Данное имя уже занято'] });
            const inputData = { name: "" };
            if (input.name && input.name !== "")
                inputData.name = input.name;
            if (input.address && input.address !== "")
                inputData.address = input.address;
            if (input.phone && input.phone !== "")
                inputData.phone = input.phone;
            if (input.email && input.email !== "")
                inputData.email = input.email;
            if (input.note && input.note !== "")
                inputData.note = input.note;
            return yield models_1.Company.create(inputData);
        });
    }
    deleteCompany(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield database_1.default.transaction();
            // 1. Проверяем существование заявителя
            const company = yield models_1.Company.findOne({
                where: { id: input.id },
                transaction
            });
            if (!company) {
                throw new error_1.NotFoundError('Не найдена Компания', { 'id': ["Не найден Компания"] });
            }
            const contractExist = yield models_1.Contract.findOne({ where: { companyId: input.id } });
            if (contractExist)
                throw new error_1.ConflictError('Нельзя удалить, так как данная компания участвует в контракте ', contractExist.name);
            // 2. Сохраняем копию данных перед удалением
            const deletedCompany = company.get({ plain: true });
            // 3. Удаляем заявителя
            yield company.destroy({ transaction });
            // 4. Проверяем, что запись действительно удалена
            const verifyDeletion = yield models_1.Company.findOne({
                where: { id: input.id },
                transaction
            });
            if (verifyDeletion) {
                throw new Error('Не удалось удалить Компанию');
            }
            yield transaction.commit();
            return deletedCompany;
        });
    }
    getCompany(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchBy, searchValue, page = 1, limit = 10, sortBy = 'createdAt', sortType = 'ASC' } = input;
            try {
                const offset = (page - 1) * limit;
                // Создаем базовые условия запроса
                const where = {};
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
                const result = yield models_1.Company.findAndCountAll({
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
                console.error('Error fetching:', error);
                throw error;
            }
        });
    }
    updateCompany(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const companyExist = yield models_1.Company.findOne({ where: { id: input.id } });
            if (!companyExist)
                throw new error_1.NotFoundError('Не найдена Компания', { 'id': ["Не найдена Компания"] });
            if (companyExist.name === input.name &&
                companyExist.address === input.address &&
                companyExist.phone === input.phone &&
                companyExist.email === input.email &&
                companyExist.note === input.note)
                throw new error_1.ConflictError('Вы ничего не изменили');
            if (companyExist.name !== input.name) {
                const nameCountExist = yield models_1.Company.count({ where: { name: input.name } });
                if (nameCountExist > 0)
                    throw new error_1.ConflictError('name', { name: ['Данное имя уже занято'] });
                companyExist.name = input.name;
            }
            if (input.address && input.address !== "")
                companyExist.address = input.address;
            if (input.phone && input.phone !== "")
                companyExist.phone = input.phone;
            if (input.email && input.email !== "")
                companyExist.email = input.email;
            if (input.note && input.note !== "")
                companyExist.note = input.note;
            yield companyExist.save();
            return yield companyExist;
        });
    }
}
exports.CompanyRepository = CompanyRepository;

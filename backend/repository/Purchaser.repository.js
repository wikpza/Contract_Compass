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
exports.PurchaserRepository = void 0;
const models_1 = require("../database/models");
const sequelize_1 = require("sequelize");
const error_1 = require("../utils/error");
const database_1 = __importDefault(require("../database"));
class PurchaserRepository {
    createPurchaser(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const inputData = { name: "" };
            // const nameExist = await Purchaser.findOne({where:{name:input.name}})
            // if(nameExist) throw new ConflictError('name', {name:['Данное имя уже занято']})
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
            return yield models_1.Purchaser.create(inputData);
        });
    }
    deletePurchaser(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield database_1.default.transaction();
            // 1. Проверяем существование заявителя
            const purchaser = yield models_1.Purchaser.findOne({
                where: { id: input.id },
                transaction
            });
            if (!purchaser) {
                throw new error_1.NotFoundError('Не найден Закупщик', { 'id': ["Не найден Закупщик"] });
            }
            const contractExist = yield models_1.Contract.findOne({ where: { purchaserId: input.id } });
            if (contractExist)
                throw new error_1.ConflictError('Нельзя удалить, так как данный закупщик участвует в контракте ');
            // 2. Сохраняем копию данных перед удалением
            const deletedApplicant = purchaser.get({ plain: true });
            // 3. Удаляем заявителя
            yield purchaser.destroy({ transaction });
            // 4. Проверяем, что запись действительно удалена
            const verifyDeletion = yield models_1.Purchaser.findOne({
                where: { id: input.id },
                transaction
            });
            if (verifyDeletion) {
                throw new Error('Не удалось удалить Закупщика');
            }
            yield transaction.commit();
            return deletedApplicant;
        });
    }
    getPurchaser(input) {
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
                const result = yield models_1.Purchaser.findAndCountAll({
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
    updatePurchaser(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const purchaserExist = yield models_1.Purchaser.findOne({ where: { id: input.id } });
            if (!purchaserExist)
                throw new error_1.NotFoundError('Не найден Закупщик', { 'id': ["Не найден Закупщик"] });
            if (purchaserExist.name === input.name &&
                purchaserExist.address === input.address &&
                purchaserExist.phone === input.phone &&
                purchaserExist.email === input.email &&
                purchaserExist.note === input.note)
                throw new error_1.ConflictError('Вы ничего не изменили');
            if (purchaserExist.name !== input.name) {
                // const nameCountExist = await  Purchaser.count({where:{name:input.name}})
                // if(nameCountExist > 0) throw new ConflictError('name', {name:['Данное имя уже занято']})
                purchaserExist.name = input.name;
            }
            if (input.address && input.address !== "")
                purchaserExist.address = input.address;
            if (input.phone && input.phone !== "")
                purchaserExist.phone = input.phone;
            if (input.email && input.email !== "")
                purchaserExist.email = input.email;
            if (input.note && input.note !== "")
                purchaserExist.note = input.note;
            yield purchaserExist.save();
            return yield purchaserExist;
        });
    }
}
exports.PurchaserRepository = PurchaserRepository;

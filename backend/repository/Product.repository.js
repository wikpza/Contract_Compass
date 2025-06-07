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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const models_1 = require("../database/models");
const sequelize_1 = require("sequelize");
const error_1 = require("../utils/error");
class ProductRepository {
    createProduct(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const unitExist = yield models_1.Unit.findOne({ where: { id: input.unitId } });
            if (!unitExist)
                throw new error_1.ConflictError('unitId', { name: ['Не была найдена такая единица измерения'] });
            const productExistName = yield models_1.Product.count({ where: { name: input.name } });
            if (productExistName > 0)
                throw new error_1.ConflictError('name', { name: ['Такое название уже занято'] });
            return yield models_1.Product.create({
                name: input.name,
                unitId: input.unitId,
                note: (input === null || input === void 0 ? void 0 : input.note) || null
            });
        });
    }
    deleteProduct(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = input;
            const toDelete = yield models_1.Product.findOne({
                where: { id }
            });
            if (!toDelete)
                throw new error_1.NotFoundError('id', { id: ["not found unit"] });
            const productInventoryExist = yield models_1.ProductInventory.findOne({ where: { productId: input.id, }, include: [{ model: models_1.Contract, attributes: ["id", "name"] }], });
            if (productInventoryExist)
                throw new error_1.ConflictError('Нельзя удалить, так как данный продукт используется в контракте ', (productInventoryExist === null || productInventoryExist === void 0 ? void 0 : productInventoryExist.contract) ? productInventoryExist.contract.name : "");
            const deleteObj = Object.assign({}, toDelete.get());
            yield toDelete.destroy();
            return deleteObj;
        });
    }
    getProduct(input) {
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
                const result = yield models_1.Product.findAndCountAll({
                    where,
                    order: [[sortBy, sortType]],
                    limit,
                    offset,
                    include: [{ model: models_1.Unit, attributes: ["id", "name", 'symbol'] }],
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
    updateProduct(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const productExist = yield models_1.Product.findOne({ where: { id: input.id } });
            if (!productExist)
                throw new error_1.NotFoundError('id', { id: ["Не был найден продукт"] });
            if (productExist.name === input.name &&
                productExist.unitId === input.unitId &&
                productExist.note === input.note)
                throw new error_1.ConflictError('Вы ничего не изменили');
            if (productExist.unitId !== input.unitId) {
                const unitExist = yield models_1.Unit.count({ where: { id: input.unitId } });
                if (!unitExist)
                    throw new error_1.ConflictError('unitId', { name: ['Не была найдена такая единица измерения'] });
                productExist.unitId = input.unitId;
            }
            if (productExist.name !== input.name) {
                const productExistNameCount = yield models_1.Product.count({ where: { name: input.name } });
                if (productExistNameCount > 0 && (productExist.name !== input.name))
                    throw new error_1.ConflictError('name', { name: ['Такое название уже занято'] });
                productExist.name = input.name;
            }
            if (input.note && input.note !== "")
                productExist.note = input.note;
            return yield productExist.save();
        });
    }
}
exports.ProductRepository = ProductRepository;

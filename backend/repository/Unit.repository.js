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
exports.UnitRepository = void 0;
const models_1 = require("../database/models");
const sequelize_1 = require("sequelize");
const error_1 = require("../utils/error");
class UnitRepository {
    createUnit(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const unitExistNameCount = yield models_1.Unit.count({ where: { name: input.name } });
            if (unitExistNameCount > 0)
                throw new error_1.ConflictError('name', { name: ['Такое название уже занято'] });
            const unitExistSymbolCount = yield models_1.Unit.count({ where: { symbol: input.symbol } });
            if (unitExistSymbolCount > 0)
                throw new error_1.ConflictError('symbol', { symbol: ['Такая аббревиатура уже занята'] });
            return yield models_1.Unit.create({
                name: input.name,
                symbol: input.symbol
            });
        });
    }
    deleteUnit(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = input;
            const unitToDelete = yield models_1.Unit.findOne({
                where: { id }
            });
            if (!unitToDelete)
                throw new error_1.NotFoundError('id', { id: ["not found unit"] });
            const productExist = yield models_1.Product.findOne({ where: { unitId: input.id, } });
            if (productExist)
                throw new error_1.ConflictError('Нельзя удалить, так как данная Единица измерения используется в продукте ', productExist.name);
            const deletedUnit = Object.assign({}, unitToDelete.get());
            yield unitToDelete.destroy();
            return deletedUnit;
        });
    }
    getUnit(input) {
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
                const result = yield models_1.Unit.findAndCountAll({
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
    updateUnit(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const unitExisted = yield models_1.Unit.findOne({ where: { id: input.id } });
            if (!unitExisted)
                throw new error_1.NotFoundError('id', { id: ["Не была найдена Единица измерения"] });
            let hasChange = false;
            if (unitExisted.name !== input.name) {
                const unitExistNameCount = yield models_1.Unit.count({ where: { name: input.name } });
                if (unitExistNameCount > 0)
                    throw new error_1.ConflictError('name', { name: ['Такое название уже занято'] });
                unitExisted.name = input.name;
                hasChange = true;
            }
            if (unitExisted.symbol !== input.symbol) {
                const unitExistSymbolCount = yield models_1.Unit.count({ where: { symbol: input.symbol } });
                if (unitExistSymbolCount > 0)
                    throw new error_1.ConflictError('symbol', { symbol: ['Такая аббревиатура уже занята'] });
                unitExisted.symbol = input.symbol;
                hasChange = true;
            }
            if (!hasChange)
                throw new error_1.ConflictError('Не было внесено изменений');
            yield unitExisted.save();
            return unitExisted;
        });
    }
}
exports.UnitRepository = UnitRepository;

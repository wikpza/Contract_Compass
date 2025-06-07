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
exports.CurrencyRepository = void 0;
const models_1 = require("../database/models");
const error_1 = require("../utils/error");
const sequelize_1 = require("sequelize");
class CurrencyRepository {
    createCurrency(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const currencyExistName = yield models_1.Currency.findOne({ where: { name: input.name } });
            if (currencyExistName)
                throw new error_1.ConflictError('name', { name: ['Данное название уже занято'] });
            const currencyExistSymbol = yield models_1.Currency.findOne({ where: { symbol: input.symbol } });
            if (currencyExistSymbol)
                throw new error_1.ConflictError('symbol', { symbol: ['Данный символ уже занят'] });
            const currencyExistCode = yield models_1.Currency.findOne({ where: { code: input.code } });
            if (currencyExistCode)
                throw new error_1.ConflictError('code', { code: ['Данный код уже занят'] });
            return yield models_1.Currency.create({
                name: input.name,
                code: input.code,
                symbol: input.symbol
            });
        });
    }
    deleteCurrency(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = input;
            const toDelete = yield models_1.Currency.findOne({
                where: { id }
            });
            if (!toDelete)
                throw new error_1.NotFoundError('id', { id: ["Не удалось найти валюту"] });
            // const productExist = await Product.findOne({where:{unitId:input.id,}})
            // if(productExist) throw new ConflictError('Нельзя удалить, так как данная Единица измерения используется в продукте ', productExist.name)
            const deletedCurrency = Object.assign({}, toDelete.get());
            yield toDelete.destroy();
            return deletedCurrency;
        });
    }
    getCurrency(input) {
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
                const result = yield models_1.Currency.findAndCountAll({
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
    updateCurrency(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const currencyExist = yield models_1.Currency.findOne({ where: { id: input.id } });
            if (!currencyExist)
                throw new error_1.NotFoundError('id', { id: ['не удалось найти валюту'] });
            const currencyExistName = yield models_1.Currency.findOne({ where: { name: input.name } });
            if (currencyExistName && (currencyExist.name !== input.name))
                throw new error_1.ConflictError('name', { name: ['Данное название уже занято'] });
            const currencyExistSymbol = yield models_1.Currency.findOne({ where: { symbol: input.symbol } });
            if (currencyExistSymbol && (currencyExist.symbol !== input.symbol))
                throw new error_1.ConflictError('symbol', { symbol: ['Данный символ уже занят'] });
            const currencyExistCode = yield models_1.Currency.findOne({ where: { code: input.code } });
            if (currencyExistCode && (currencyExist.code !== input.code))
                throw new error_1.ConflictError('code', { code: ['Данный код уже занят'] });
            currencyExist.name = input.name;
            currencyExist.symbol = input.symbol;
            currencyExist.code = input.code;
            yield currencyExist.save();
            return currencyExist;
        });
    }
}
exports.CurrencyRepository = CurrencyRepository;

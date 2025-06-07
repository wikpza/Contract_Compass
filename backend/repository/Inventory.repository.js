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
exports.InventoryRepository = void 0;
const models_1 = require("../database/models");
const sequelize_1 = require("sequelize");
const error_1 = require("../utils/error");
const database_1 = __importDefault(require("../database"));
class InventoryRepository {
    addInventoryProduct(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const inventoryExist = yield models_1.ProductInventory.findOne({ where: { id: input.id } });
            if (!inventoryExist)
                throw new error_1.NotFoundError("Не удалось найти товар");
            if (input.type === 'issued' && (input.amount + inventoryExist.takeQuantity) > inventoryExist.contractQuantity)
                throw new error_1.ConflictError('amount', { amount: ['Полученное количество не может превышать количества по контракту'] });
            if (input.type === 'refund' && (inventoryExist.takeQuantity - input.amount) < 0)
                throw new error_1.ConflictError('amount', { amount: ['Полученное количество не может меньше нуля'] });
            const inputData = {
                type: input.type,
                amount: input.amount,
                giveDate: input.giveDate,
                productInventoryId: input.id,
                quantity: input.id
            };
            if ((input === null || input === void 0 ? void 0 : input.note) && (input === null || input === void 0 ? void 0 : input.note) !== "")
                inputData.note = input.note;
            const contractExist = yield models_1.Contract.findOne({ where: { id: inventoryExist.contractId } });
            if (!contractExist)
                throw new error_1.NotFoundError('Не удалось найти контракт');
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            const transaction = yield database_1.default.transaction();
            try {
                const newInventoryHistory = yield models_1.ProductInventoryHistory.create(inputData, { transaction });
                if (input.type === 'issued')
                    inventoryExist.takeQuantity = inventoryExist.takeQuantity + input.amount;
                else
                    inventoryExist.takeQuantity = inventoryExist.takeQuantity - input.amount;
                yield inventoryExist.save({ transaction });
                yield transaction.commit();
                return newInventoryHistory;
            }
            catch (error) {
                yield transaction.rollback();
                console.error('Transaction failed:', error);
                throw new error_1.APIError("Получение не удалось");
            }
            return Promise.resolve({});
        });
    }
    addProductContract(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const productInventoryExist = yield models_1.ProductInventory.findOne({ where: { productId: input.productId, contractId: input.contractId } });
            if (productInventoryExist)
                throw new error_1.ConflictError('contractId', { contractId: ['Продукт уже был добавлен'] });
            const productExist = yield models_1.Product.findOne({ where: { id: input.productId } });
            if (!productExist)
                throw new error_1.NotFoundError('productId', { productId: ['Не удалось найти продукт'] });
            const contractExist = yield models_1.Contract.findOne({ where: { id: input.contractId } });
            if (!contractExist)
                throw new error_1.NotFoundError('contractId', { contractId: ['Не удалось найти контракт'] });
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            const inputData = {
                productId: input.productId,
                contractId: input.contractId,
                contractQuantity: input.contractQuantity
            };
            if ((input === null || input === void 0 ? void 0 : input.note) && input.note !== "")
                inputData.note = input.note;
            return yield models_1.ProductInventory.create(inputData);
        });
    }
    getInventory(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const { searchBy, searchValue, page = 1, limit = 10, sortBy = 'createdAt', sortType = 'ASC' } = input;
            try {
                const offset = (page - 1) * limit;
                // Создаем базовые условия запроса
                const where = { contractId: input.contractId };
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
                const result = yield models_1.ProductInventory.findAndCountAll({
                    where,
                    order: [[sortBy, sortType]],
                    include: [
                        { model: models_1.Product, include: [{ model: models_1.Unit }] },
                        { model: models_1.Contract }
                    ],
                    limit,
                    offset,
                    // Для MSSQL нужно добавить distinct: true при использовании findAndCountAll с limit/offset
                    distinct: true
                });
                const result1 = yield models_1.ProductInventory.findAll({
                    where: {
                        contractId: input.contractId,
                    },
                    attributes: [
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('contractQuantity')), 'contractQuantity'],
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('takeQuantity')), 'takeQuantity'],
                    ],
                    raw: true,
                });
                (_a = result1[0]) === null || _a === void 0 ? void 0 : _a.contractQuantity;
                return {
                    rows: result.rows,
                    count: result.count,
                    totalCount: ((_b = result1[0]) === null || _b === void 0 ? void 0 : _b.contractQuantity) | 0,
                    lastCount: (((_c = result1[0]) === null || _c === void 0 ? void 0 : _c.contractQuantity) | 0) - (((_d = result1[0]) === null || _d === void 0 ? void 0 : _d.takeQuantity) | 0)
                };
            }
            catch (error) {
                console.error('Error fetching units:', error);
                throw error;
            }
        });
    }
    getInventoryHistory(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchBy, searchValue, page = 1, limit = 10, sortBy = 'createdAt', sortType = 'ASC' } = input;
            try {
                const offset = (page - 1) * limit;
                // Создаем базовые условия запроса
                const where = {
                    productInventoryId: input.contractId
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
                const result = yield models_1.ProductInventoryHistory.findAndCountAll({
                    where,
                    order: [[sortBy, sortType]],
                    include: [
                        { model: models_1.ProductInventory,
                            include: [
                                { model: models_1.Product, include: [{ model: models_1.Unit }] },
                            ]
                        },
                    ],
                    limit,
                    offset,
                    // Для MSSQL нужно добавить distinct: true при использовании findAndCountAll с limit/offset
                    distinct: true
                });
                return {
                    rows: result.rows,
                    count: result.count,
                };
            }
            catch (error) {
                console.error('Error fetching units:', error);
                throw error;
            }
        });
    }
    deleteInventory(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const inventoryExist = yield models_1.ProductInventory.findOne({ where: { id: input.id } });
            if (!inventoryExist)
                throw new error_1.NotFoundError('Не удалось найти товар');
            const contractExist = yield models_1.Contract.findOne({ where: { id: inventoryExist.contractId } });
            if (!contractExist)
                throw new error_1.NotFoundError('Не удалось найти контракт');
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            const transaction = yield database_1.default.transaction();
            try {
                yield models_1.ProductInventoryHistory.destroy({
                    where: { productInventoryId: input.id },
                    transaction
                });
                yield models_1.ProductInventory.destroy({
                    where: { id: input.id },
                    transaction
                });
                yield transaction.commit();
                return inventoryExist;
            }
            catch (error) {
                yield transaction.rollback();
                console.error('Transaction failed:', error);
                throw new error_1.APIError("Не удалось удалить");
            }
        });
    }
    updateInventory(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const inventoryExist = yield models_1.ProductInventory.findOne({ where: { id: input.id } });
            if (!inventoryExist)
                throw new error_1.NotFoundError('id', { id: ['Не удалось найти товар'] });
            const contractExist = yield models_1.Contract.findOne({ where: { id: inventoryExist.contractId } });
            if (!contractExist)
                throw new error_1.NotFoundError('Не удалось найти контракт');
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            if (inventoryExist.takeQuantity > input.contractQuantity)
                throw new error_1.ConflictError('contractQuantity', { contractQuantity: ['Количество по контракту не может быть меньше полученного количества'] });
            inventoryExist.contractQuantity = input.contractQuantity;
            yield inventoryExist.save();
            return inventoryExist;
        });
    }
}
exports.InventoryRepository = InventoryRepository;

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
exports.PaymentRepository = void 0;
const models_1 = require("../database/models");
const sequelize_1 = require("sequelize");
const error_1 = require("../utils/error");
const database_1 = __importDefault(require("../database"));
class PaymentRepository {
    cancelPayment(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const contractPaymentExist = yield models_1.ContractPaymentHistory.findOne({ where: { id: input.id }, include: [{ model: models_1.Contract, attributes: ['amount', 'giveAmount', 'currencyId'] }] });
            if (!contractPaymentExist)
                throw new error_1.NotFoundError('Не удалось найти Транзакцию');
            if (contractPaymentExist.type === 'canceled')
                throw new error_1.ConflictError('Транзакция уже имеет статус отмененный');
            let contractPaymentAmount = contractPaymentExist.amount;
            if (contractPaymentExist.currencyId !== contractPaymentExist.contract.currencyId)
                contractPaymentAmount = contractPaymentAmount * contractPaymentExist.contractCurrencyExchangeRate;
            if (contractPaymentExist.type === 'issued' && contractPaymentAmount > contractPaymentExist.contract.giveAmount)
                throw new error_1.ConflictError('Конечная сумма взноса не может быть меньше нуля');
            if (contractPaymentExist.type === 'refund' && (contractPaymentAmount + contractPaymentExist.contract.giveAmount) > contractPaymentExist.contract.amount)
                throw new error_1.ConflictError('Конечная сумма взноса не может быть больше сумма контракта');
            const contractExist = yield models_1.Contract.findOne({ where: { id: contractPaymentExist.contractId } });
            if (!contractExist)
                throw new error_1.NotFoundError('Не удалось найти контракт');
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            const transaction = yield database_1.default.transaction();
            console.log(contractPaymentExist);
            try {
                if (contractPaymentExist.type === 'issued') {
                    contractExist.giveAmount = contractPaymentExist.contract.giveAmount - contractPaymentAmount;
                }
                else {
                    contractExist.giveAmount = contractPaymentExist.contract.giveAmount + contractPaymentAmount;
                }
                contractPaymentExist.type = 'canceled';
                yield contractExist.save({ transaction });
                yield contractPaymentExist.save({ transaction });
                yield transaction.commit();
                return contractPaymentExist;
            }
            catch (error) {
                yield transaction.rollback();
                console.error('Transaction failed:', error);
                throw new error_1.APIError("Отмена не прошла, попробуйте позже");
            }
        });
    }
    createPayment(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const contractExist = yield models_1.Contract.findOne({ where: { id: input.contractId },
                include: [{ model: models_1.Currency, attributes: ['code'] }]
            });
            if (!contractExist)
                throw new error_1.NotFoundError("id", { id: ['Не удалось найти Контракт'] });
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            if (input.type === 'issued' && contractExist.giveAmount >= contractExist.amount)
                throw new error_1.ConflictError('amount', { amount: ['Нельзя провести транзакцию, так как уже внесена вся сумма'] });
            const currencyExist = yield models_1.Currency.findOne({ where: { id: input.currencyId },
            });
            if (!currencyExist)
                throw new error_1.NotFoundError("id", { id: ['Не удалось найти Валюту'] });
            console.log(typeof input.giveDate);
            const inputData = {
                type: input.type,
                contractId: input.contractId,
                currencyId: input.currencyId,
                amount: input.amount,
                giveDate: input.giveDate
            };
            let takeAmount = input.amount;
            if (contractExist.currencyId !== input.currencyId) {
                if (!input.contractCurrencyExchangeRate)
                    throw new error_1.NotFoundError('contractCurrencyExchangeRate', { contractCurrencyExchangeRate: [`Вы не определили курс Валюты ${(_a = contractExist === null || contractExist === void 0 ? void 0 : contractExist.currency) === null || _a === void 0 ? void 0 : _a.code} - ${currencyExist.code}`] });
                takeAmount = input.amount * input.contractCurrencyExchangeRate;
                inputData.contractCurrencyExchangeRate = input.contractCurrencyExchangeRate;
            }
            if ((input === null || input === void 0 ? void 0 : input.note) && (input === null || input === void 0 ? void 0 : input.note) !== "")
                inputData.note = input.note;
            const totalGiveAmount = contractExist.giveAmount + takeAmount;
            if (input.type === 'issued' && totalGiveAmount > contractExist.amount)
                throw new error_1.ConflictError('amount', { amount: "Вы уже превысили сумму контракта" });
            if (input.type === 'refund' && contractExist.giveAmount < input.amount)
                throw new error_1.ConflictError('amount', { amount: "Конечная выданная сумма не может быть меньше нуля" });
            const transaction = yield database_1.default.transaction();
            try {
                const newPaymentHistory = yield models_1.ContractPaymentHistory.create(inputData, { transaction });
                if (input.type === 'issued')
                    contractExist.giveAmount = totalGiveAmount;
                else
                    contractExist.giveAmount = contractExist.giveAmount - takeAmount;
                yield contractExist.save({ transaction });
                yield transaction.commit();
                return newPaymentHistory;
            }
            catch (error) {
                yield transaction.rollback();
                console.error('Transaction failed:', error);
                throw new error_1.APIError("Оплата не прошла, попробуйте позже");
            }
        });
    }
    getPayment(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchBy, searchValue, page = 1, limit = 10, sortBy = 'createdAt', sortType = 'ASC', } = input;
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
                const result = yield models_1.ContractPaymentHistory.findAndCountAll({
                    where,
                    order: [[sortBy, sortType]],
                    include: [{ model: models_1.Currency, attributes: ['name', 'id', 'code', 'symbol'] }],
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
    finishPayment(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const contractExist = yield models_1.Contract.findOne({ where: { id: input.contractId },
                include: [{ model: models_1.Currency, attributes: ['code'] }]
            });
            if (!contractExist)
                throw new error_1.NotFoundError("id", { id: ['Не удалось найти Контракт'] });
            if (contractExist.status === "completed")
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт уже закрыт');
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            if (contractExist.giveAmount == contractExist.amount)
                throw new error_1.ConflictError('amount', { amount: ['Нельзя провести транзакцию, так как уже внесена вся сумма'] });
            const giveAmount = contractExist.amount - contractExist.giveAmount;
            const inputData = {
                type: "issued",
                contractId: input.contractId,
                currencyId: contractExist.currencyId,
                amount: giveAmount,
                giveDate: input.giveDate
            };
            if ((input === null || input === void 0 ? void 0 : input.note) && (input === null || input === void 0 ? void 0 : input.note) !== "")
                inputData.note = input.note;
            const transaction = yield database_1.default.transaction();
            try {
                const newPaymentHistory = yield models_1.ContractPaymentHistory.create(inputData, { transaction });
                contractExist.giveAmount = contractExist.amount;
                yield contractExist.save({ transaction });
                yield transaction.commit();
                return newPaymentHistory;
            }
            catch (error) {
                yield transaction.rollback();
                console.error('Transaction failed:', error);
                throw new error_1.APIError("Оплата не прошла, попробуйте позже");
            }
        });
    }
}
exports.PaymentRepository = PaymentRepository;

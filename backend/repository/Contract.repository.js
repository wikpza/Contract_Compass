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
exports.ContractRepository = void 0;
const models_1 = require("../database/models");
const sequelize_1 = require("sequelize");
const error_1 = require("../utils/error");
const database_1 = __importDefault(require("../database"));
class ContractRepository {
    createContract(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectExist = yield models_1.Project.findOne({ where: { id: input.projectId } });
            if (!projectExist)
                throw new error_1.NotFoundError('projectId', { projectId: ['Не удалось найти Проект'] });
            const signDate = new Date(input.signDate);
            const officialBeginDate = new Date(input.officialBeginDate);
            const officialFinishDate = new Date(input.officialFinishDate);
            if (signDate > officialBeginDate)
                throw new error_1.ConflictError('signDate', { signDate: ["Дата подписания контракта не может быть позже начала контракта"] });
            if (officialFinishDate < officialBeginDate)
                throw new error_1.ConflictError('officialFinishDate', { officialFinishDate: ["Дата завершения контракта не может быть раньше начала контракта"] });
            if (projectExist.startDate > signDate)
                throw new error_1.ConflictError('signDate', { signDate: ["Дата подписания контракта не может быть раньше начала проекта"] });
            if (projectExist.finishDate && officialFinishDate > projectExist.finishDate)
                throw new error_1.ConflictError('officialFinishDate', {
                    officialFinishDate: ["Дата завершения контракта не может быть позже завершения проекта"]
                });
            const applicantExist = yield models_1.Applicant.findOne({ where: { id: input.applicantId } });
            if (!applicantExist)
                throw new error_1.NotFoundError('applicantId', { applicantId: ['Не удалось найти Заявителя'] });
            const purchaserExist = yield models_1.Purchaser.findOne({ where: { id: input.purchaserId } });
            if (!purchaserExist)
                throw new error_1.NotFoundError('purchaserId', { purchaserId: ['Не удалось найти Закупщика'] });
            const companyExist = yield models_1.Company.findOne({ where: { id: input.companyId } });
            if (!companyExist)
                throw new error_1.NotFoundError('companyId', { companyId: ['Не удалось найти Компанию'] });
            const currencyExist = yield models_1.Currency.findOne({ where: { id: input.currencyId } });
            if (!currencyExist)
                throw new error_1.NotFoundError('currencyId', { currencyId: ['Не удалось найти Валюту'] });
            const projectExistName = yield models_1.Project.findOne({ where: { name: input.name } });
            if (projectExistName)
                throw new error_1.ConflictError('name', { name: ['Данное название уже занято'] });
            const inputDate = {
                type: input.type,
                name: input.name,
                projectId: projectExist.id,
                applicantId: applicantExist.id,
                purchaserId: purchaserExist.id,
                companyId: companyExist.id,
                currencyId: currencyExist.id,
                amount: input.amount,
                signDate: input.signDate,
                officialBeginDate: input.officialBeginDate,
                officialFinishDate: input.officialFinishDate,
            };
            if (input.note && input.note !== "")
                inputDate.note = input.note;
            if (projectExist.currencyId !== input.currencyId)
                inputDate.projectCurrencyExchangeRate = input.projectCurrencyExchangeRate;
            return yield models_1.Contract.create(inputDate);
        });
    }
    deleteContract(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = input;
            return yield database_1.default.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const toDelete = yield models_1.Contract.findOne({
                    where: { id },
                    transaction,
                });
                if (!toDelete)
                    throw new error_1.NotFoundError('id', { id: ["not found unit"] });
                const fileVolumeExist = yield models_1.FileVolume.findOne({ where: { contractId: id }, transaction });
                if (fileVolumeExist)
                    throw new error_1.ConflictError('Нельзя удалить, так как у контракта есть файлы');
                const fileLinkExist = yield models_1.FileLink.findOne({ where: { contractId: id }, transaction });
                if (fileLinkExist)
                    throw new error_1.ConflictError('Нельзя удалить, так как у контракта есть файлы-ссылки');
                // Найдём все записи ProductInventory, связанные с контрактом
                const inventories = yield models_1.ProductInventory.findAll({
                    where: { contractId: id },
                    transaction,
                });
                // Удалим связанные ProductInventoryHistory
                for (const inventory of inventories) {
                    yield models_1.ProductInventoryHistory.destroy({
                        where: { productInventoryId: inventory.id },
                        transaction,
                    });
                }
                // Удалим ProductInventory
                yield models_1.ProductInventory.destroy({
                    where: { contractId: id },
                    transaction,
                });
                yield models_1.ContractPaymentHistory.destroy({
                    where: { contractId: id },
                    transaction,
                });
                const deleteObj = Object.assign({}, toDelete.get());
                // Удалим контракт
                yield toDelete.destroy({ transaction });
                return deleteObj;
            }));
        });
    }
    getContract(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchBy, searchValue, page = 1, limit = 10, sortBy = 'createdAt', sortType = 'ASC', type, projectId } = input;
            try {
                const offset = (page - 1) * limit;
                // Создаем базовые условия запроса
                const where = {};
                if (projectId)
                    where.projectId = projectId;
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
                if (type && (type === 'service' || type === 'product'))
                    where["type"] = type;
                // Выполняем запрос
                const result = yield models_1.Contract.findAndCountAll({
                    where,
                    order: [[sortBy, sortType]],
                    include: [
                        { model: models_1.Applicant, attributes: ["id", "name"] },
                        { model: models_1.Purchaser, attributes: ["id", "name"] },
                        { model: models_1.Company, attributes: ["id", "name"] },
                        { model: models_1.Currency, attributes: ["id", "name", 'symbol', 'code'] },
                        { model: models_1.Project, attributes: ["id", "name"] },
                    ],
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
    updateContract(input) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const contractExist = yield models_1.Contract.findOne({ where: { id: input.id },
                include: [
                    { model: models_1.Project, attributes: ["id", "name", "currencyId"], },
                ],
            });
            if (!contractExist)
                throw new error_1.NotFoundError('contractId', { contractId: ['Контракт не найден'] });
            if (contractExist.status === "completed")
                throw new error_1.ConflictError('Нельзя изменить данные о контракте, так как он завершен');
            if (contractExist.status === "canceled")
                throw new error_1.ConflictError('Нельзя изменить данные о контракте, так как он отменен');
            if (contractExist.projectCurrencyExchangeRate !== input.projectCurrencyExchangeRate) {
                console.log('Изменено поле projectCurrencyExchangeRate:', {
                    было: contractExist.projectCurrencyExchangeRate,
                    стало: input.projectCurrencyExchangeRate
                });
            }
            if (contractExist.note !== input.note) {
                console.log('Изменено поле note:', {
                    было: contractExist.note,
                    стало: input.note
                });
            }
            const signDate = new Date(input.signDate).getTime();
            const officialBeginDate = new Date(input.officialBeginDate).getTime();
            const officialFinishDate = new Date(input.officialFinishDate).getTime();
            if (contractExist.type === input.type &&
                contractExist.name === input.name &&
                contractExist.projectId === input.projectId &&
                contractExist.applicantId === input.applicantId &&
                contractExist.purchaserId === input.purchaserId &&
                contractExist.companyId === input.companyId &&
                contractExist.amount === input.amount &&
                contractExist.currencyId === input.currencyId &&
                contractExist.signDate.getTime() === signDate &&
                contractExist.officialBeginDate.getTime() === officialBeginDate &&
                contractExist.officialFinishDate.getTime() === officialFinishDate &&
                contractExist.projectCurrencyExchangeRate == input.projectCurrencyExchangeRate &&
                contractExist.note == input.note)
                throw new error_1.ConflictError('Вы ничего не изменили.');
            if (input.name !== contractExist.name) {
                const contractNameCount = yield models_1.Contract.count({ where: { name: input.name } });
                if (contractNameCount > 0)
                    throw new error_1.ConflictError('name', { name: ['Данное название уже занято'] });
                contractExist.name = input.name;
            }
            if (contractExist.projectId !== input.projectId) {
                const projectExist = yield models_1.Project.findOne({ where: { id: input.projectId } });
                if (!projectExist)
                    throw new error_1.NotFoundError('projectId', { projectId: ['Проект не найден'] });
                contractExist.projectId = input.projectId;
            }
            if (contractExist.applicantId !== input.applicantId) {
                const applicantExist = yield models_1.Applicant.findOne({ where: { id: input.applicantId } });
                if (!applicantExist)
                    throw new error_1.NotFoundError('applicantId', { applicantId: ['Заявитель не найден'] });
                contractExist.applicantId = input.applicantId;
            }
            if (contractExist.purchaserId !== input.purchaserId) {
                const purchaserExist = yield models_1.Purchaser.findOne({ where: { id: input.purchaserId } });
                if (!purchaserExist)
                    throw new error_1.NotFoundError('purchaserId', { purchaserId: ['Закупщик не найден'] });
                contractExist.purchaserId = input.purchaserId;
            }
            if (contractExist.companyId !== input.companyId) {
                const companyExist = yield models_1.Company.findOne({ where: { id: input.companyId } });
                if (!companyExist)
                    throw new error_1.NotFoundError('companyId', { companyId: ['Компания не найдена'] });
                contractExist.companyId = input.companyId;
            }
            if (contractExist.amount !== input.amount) {
                contractExist.amount = input.amount;
            }
            if (contractExist.type !== input.type && (input.type === "product" || input.type === 'service')) {
                // LOgica check lsjfljslfjasdf;l
                contractExist.type = input.type;
            }
            if (contractExist.currencyId !== input.currencyId) {
                const currencyExist = yield models_1.Currency.findOne({ where: { id: input.currencyId } });
                if (!currencyExist)
                    throw new error_1.NotFoundError('currencyId', { currencyId: ['Валюта не найдена'] });
                if (((_a = contractExist === null || contractExist === void 0 ? void 0 : contractExist.project) === null || _a === void 0 ? void 0 : _a.currencyId) !== input.currencyId) {
                    if (!input.projectCurrencyExchangeRate)
                        throw new error_1.ValidationError('Вы не определили курс валюты к ');
                    contractExist.projectCurrencyExchangeRate = input.projectCurrencyExchangeRate;
                }
                else {
                    contractExist.projectCurrencyExchangeRate = 1;
                }
                contractExist.currencyId = input.currencyId;
            }
            if (contractExist.officialBeginDate.getTime() !== officialBeginDate
                ||
                    contractExist.officialFinishDate.getTime() !== officialFinishDate
                ||
                    contractExist.signDate.getTime() !== signDate) {
                if (officialBeginDate < signDate)
                    throw new error_1.ConflictError('Дата начала контракта не может быть раньше подписания', { officialBeginDate: ['Дата начала контракта не может быть раньше подписания'] });
                if (officialBeginDate > officialFinishDate)
                    throw new error_1.ConflictError('Дата завершения не может быть раньше даты начала', { officialBeginDate: ['Дата завершения не может быть раньше даты начала'] });
                const projectExist = yield models_1.Project.findOne({ where: { id: contractExist.projectId } });
                if (!projectExist)
                    throw new error_1.NotFoundError('Не удалось найти Контракт');
                if (projectExist.startDate.getTime() > signDate)
                    throw new error_1.ConflictError('signDate', { signDate: ["Дата подписания контракта не может быть раньше начала проекта"] });
                if (projectExist.finishDate && officialFinishDate > projectExist.finishDate.getTime())
                    throw new error_1.ConflictError('officialFinishDate', {
                        officialFinishDate: ["Дата завершения контракта не может быть позже завершения проекта"]
                    });
                if (contractExist.officialBeginDate.getTime() !== officialBeginDate) {
                    contractExist.officialBeginDate = new Date(input.officialBeginDate);
                }
                if (contractExist.officialFinishDate.getTime() !== officialFinishDate) {
                    contractExist.officialFinishDate = new Date(input.officialFinishDate);
                }
                if (contractExist.signDate.getTime() !== signDate) {
                    contractExist.signDate = new Date(input.signDate);
                }
            }
            if (input.note != contractExist.note) {
                contractExist.note = input.note;
            }
            yield contractExist.save();
            return contractExist;
        });
    }
    getContractDetail(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const contractExist = yield models_1.Contract.findOne({
                where: { id: input.id },
                include: [
                    { model: models_1.Applicant, attributes: ["id", "name", 'email', 'phone'] },
                    { model: models_1.Purchaser, attributes: ["id", "name", 'email', 'phone'] },
                    { model: models_1.Company, attributes: ["id", "name", 'email', 'phone'] },
                    { model: models_1.Currency, attributes: ["id", "name", 'symbol', 'code'] },
                    { model: models_1.Project, attributes: ["id", "name", "note"] },
                ],
            });
            if (!contractExist)
                throw new error_1.NotFoundError('id', { id: ['Не удалось найти контракт'] });
            return contractExist;
        });
    }
    changeStatus(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const contractExist = yield models_1.Contract.findOne({ where: { id: input.id } });
            if (!contractExist)
                throw new error_1.NotFoundError('Не удалось найти контракт');
            if (input.status === contractExist.status)
                throw new error_1.ConflictError("Вы ничего не изменили");
            if (input.status === 'active' || input.status === "canceled") {
                contractExist.status = input.status;
                yield contractExist.save();
                return contractExist;
            }
            if (contractExist.giveAmount !== contractExist.amount)
                throw new error_1.ConflictError('Вы не выплатили всю сумму по контракту');
            if (contractExist.type === 'product') {
                const productContract = yield models_1.ProductInventory.findAll({
                    where: {
                        contractId: contractExist.id,
                        contractQuantity: {
                            [sequelize_1.Op.gt]: sequelize_1.Sequelize.col('takeQuantity')
                        }
                    }
                });
                if (productContract.length > 0)
                    throw new error_1.ConflictError('Не все товары были получены');
            }
            contractExist.officialFinishDate = new Date();
            contractExist.status = 'completed';
            yield contractExist.save();
            return contractExist;
        });
    }
}
exports.ContractRepository = ContractRepository;

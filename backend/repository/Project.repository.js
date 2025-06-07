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
exports.ProjectRepository = void 0;
const models_1 = require("../database/models");
const sequelize_1 = require("sequelize");
const error_1 = require("../utils/error");
const database_1 = __importDefault(require("../database"));
const errors_1 = require("../utils/errors");
class ProjectRepository {
    createProject(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectNameExist = yield models_1.Project.count({ where: { name: input.name } });
            if (projectNameExist > 0)
                throw new error_1.ConflictError('name', { name: ["Данное название уже занято"] });
            if (input.finishDate <= input.startDate)
                throw new error_1.ConflictError('finishDate', { name: ["Дата окончания не может быть раньше чем начало"] });
            const inputData = { name: input.name,
                currencyId: input.currencyId,
                startDate: input.startDate,
                finishDate: input.finishDate, };
            if (input.note && input.note !== "")
                inputData.note = input.note;
            return yield models_1.Project.create(inputData);
        });
    }
    deleteProject(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = input;
            const toDelete = yield models_1.Project.findOne({
                where: { id }
            });
            if (!toDelete)
                throw new error_1.NotFoundError('id', { id: ["Не найден Проект"] });
            const contractExist = yield models_1.Contract.findOne({ where: { projectId: input.id } });
            if (contractExist)
                throw new error_1.ConflictError('Нельзя удалить, так как он имеет контракты');
            const accessLinkExist = yield models_1.AccessLink.findOne({ where: { projectId: input.id } });
            if (accessLinkExist)
                throw new error_1.ConflictError('Нельзя удалить, так как есть ссылка доступа');
            const deletedProject = Object.assign({}, toDelete.get());
            yield toDelete.destroy();
            return deletedProject;
        });
    }
    getProject(input) {
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
                const result = yield models_1.Project.findAndCountAll({
                    where,
                    order: [[sortBy, sortType]],
                    limit,
                    offset,
                    include: [{ model: models_1.Currency, attributes: ["id", "name", 'symbol', "code"] }],
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
    updateProject(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectExist = yield models_1.Project.findOne({ where: { id: input.id } });
            if (!projectExist)
                throw new error_1.NotFoundError('id', { id: ['Проект не был найден'] });
            if (!projectExist.status)
                throw new error_1.ConflictError('Нельзя изменить данные, так как проект завершен');
            const officialBeginDate = new Date(input.startDate).getTime();
            const officialFinishDate = new Date(input.finishDate).getTime();
            if (projectExist.name === input.name &&
                projectExist.startDate.getTime() === officialBeginDate &&
                projectExist.finishDate.getTime() === officialFinishDate &&
                projectExist.currencyId == input.currencyId &&
                projectExist.note == input.note)
                throw new error_1.ConflictError('Вы ничего не изменили.');
            if (projectExist.name !== input.name) {
                const projectExistNameCount = yield models_1.Project.count({ where: { name: input.name } });
                if (projectExistNameCount > 0)
                    throw new error_1.ConflictError('name', { name: ['Такое название уже занято'] });
                projectExist.name = input.name;
            }
            if (input.currencyId !== projectExist.currencyId) {
                const contractCount = yield models_1.Contract.count({ where: { projectId: projectExist.id } });
                if (contractCount > 0)
                    throw new error_1.ConflictError('currencyId', { currencyId: ['Нельзя изменить Валюту проекта, так как есть контракты'] });
                const currencyExist = yield models_1.Currency.findOne({ where: { id: input.currencyId } });
                if (!currencyExist)
                    throw new error_1.NotFoundError('currencyId', { currencyId: ['Не удалось найти валюту'] });
                projectExist.currencyId = input.currencyId;
            }
            if (projectExist.startDate.getTime() !== officialBeginDate ||
                projectExist.finishDate.getTime() !== officialFinishDate) {
                // Проверяем, что новая дата начала не позже новой даты окончания
                if (officialBeginDate > officialFinishDate) {
                    throw new error_1.ConflictError('date', {
                        startDate: ['Дата начала не может быть позже даты окончания'],
                        finishDate: ['Дата окончания не может быть раньше даты начала']
                    });
                }
                // Проверяем, что все контракты проекта входят в новый период
                const contracts = yield models_1.Contract.findAll({
                    where: {
                        projectId: projectExist.id,
                        [sequelize_1.Op.or]: [
                            { signDate: { [sequelize_1.Op.lt]: new Date(input.startDate) } },
                            { officialFinishDate: { [sequelize_1.Op.gt]: new Date(input.finishDate) } }
                        ]
                    }
                });
                if (contracts.length > 0) {
                    throw new error_1.ConflictError('date', {
                        startDate: ['Некоторые контракты выходят за рамки нового периода проекта'],
                        finishDate: ['Некоторые контракты выходят за рамки нового периода проекта']
                    });
                }
                // Обновляем даты проекта, если проверки пройдены
                projectExist.startDate = new Date(input.startDate);
                projectExist.finishDate = new Date(input.finishDate);
            }
            if (input.note !== undefined) {
                projectExist.note = input.note;
            }
            yield projectExist.save();
            return projectExist;
        });
    }
    getProjectDetail(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectExist = yield models_1.Project.findOne({ where: { id: input.id }, include: [{ model: models_1.Currency, attributes: ["id", "name", 'symbol', "code"] }], });
            if (!projectExist)
                throw new error_1.NotFoundError('id', { id: ['Не удалось найти проект'] });
            const productContractCount = yield models_1.Contract.count({ where: { projectId: input.id, type: 'product' } });
            const productServiceCount = yield models_1.Contract.count({ where: { projectId: input.id, type: 'service' } });
            const activeCount = yield models_1.Contract.count({ where: { projectId: input.id, status: 'active' } });
            const completedCount = yield models_1.Contract.count({ where: { projectId: input.id, type: 'completed' } });
            const canceledCount = yield models_1.Contract.count({ where: { projectId: input.id, type: 'canceled' } });
            let params = {
                totalAmount: 0, deliveredProductCount: 0, totalSpent: 0, totalProductCount: 0
            };
            try {
                const response = yield database_1.default.query("EXEC GetProjectStats @ProjectId = :id", {
                    replacements: {
                        id: input.id,
                    },
                    type: sequelize_1.QueryTypes.RAW
                });
                if (!Array.isArray(response) || !Array.isArray(response[0])) {
                    throw new error_1.ConflictError('Не удалось загрузить данные');
                }
                const stats = response[0][0];
                ;
                // Проверка наличия и типа возвращаемых значений
                if (stats && typeof stats === 'object' && !Array.isArray(stats)) {
                    // Проверка наличия ключей
                    const hasRequiredKeys = [
                        'totalProductCount',
                        'deliveredProductCount',
                        'totalAmount',
                        'totalSpent'
                    ].every(key => key in stats);
                    if (hasRequiredKeys) {
                        // Проверка типов для каждого ключа
                        params.totalProductCount = typeof stats.totalProductCount === 'number' ? stats.totalProductCount : 0;
                        params.deliveredProductCount = typeof stats.deliveredProductCount === 'number' ? stats.deliveredProductCount : 0;
                        params.totalAmount = typeof stats.totalAmount === 'number' ? stats.totalAmount : 0;
                        params.totalSpent = typeof stats.totalSpent === 'number' ? stats.totalSpent : 0;
                    }
                    else {
                        console.warn("Хранимая процедура вернула объект без требуемых ключей");
                        // Сброс значений
                        params = {
                            totalProductCount: 0,
                            deliveredProductCount: 0,
                            totalAmount: 0,
                            totalSpent: 0
                        };
                    }
                }
                else {
                    console.warn("Хранимая процедура вернула некорректные данные");
                    // Сброс значений
                    params = {
                        totalProductCount: 0,
                        deliveredProductCount: 0,
                        totalAmount: 0,
                        totalSpent: 0
                    };
                }
            }
            catch (error) {
                if (error instanceof sequelize_1.Error) {
                    console.error("Ошибка при выполнении процедуры GetProjectStats:", error.message);
                    const sqlError = error;
                    if (sqlError.message) {
                        // Печатаем содержимое original, чтобы понять, что это за объект
                        console.error("SQL Ошибка:", sqlError.message);
                        if (typeof sqlError.message === 'string') {
                            (0, errors_1.checkSQLErrorMessage)(sqlError.message);
                        }
                    }
                    else {
                        throw new error_1.BaseError("Internal SQL error", 500, "Internal SQL error", error);
                    }
                }
                throw new error_1.BaseError("Internal SQL error", 500, "Internal SQL error", error);
            }
            return {
                project: projectExist,
                productCount: productContractCount,
                serviceCount: productServiceCount,
                activeCount: activeCount,
                completedCount: completedCount,
                canceledCount: canceledCount,
                totalProductCount: params.totalProductCount,
                deliveredProductCount: params.deliveredProductCount,
                totalAmount: params.totalAmount,
                totalSpent: params.totalSpent
                // totalProductCount:0,
                // deliveredProductCount:0,
                //
                // totalAmount:0,
                // totalSpent:0
            };
        });
    }
    updateProjectStatus(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectExist = yield models_1.Project.findOne({ where: {
                    id: input.id
                } });
            if (!projectExist)
                throw new error_1.NotFoundError('Не удалось найти проект');
            if (projectExist.status) {
                const contractExist = yield models_1.Contract.findOne({ where: {
                        status: 'active',
                        projectId: input.id
                    } });
                if (contractExist)
                    throw new error_1.ConflictError('Есть незавершенные контракты');
            }
            projectExist.status = !projectExist.status;
            yield projectExist.save();
            return projectExist;
        });
    }
}
exports.ProjectRepository = ProjectRepository;

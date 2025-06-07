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
exports.FileRepository = void 0;
const models_1 = require("../database/models");
const minio_1 = require("../database/minio");
const utils_1 = require("../utils");
const error_1 = require("../utils/error");
const database_1 = __importDefault(require("../database"));
const sequelize_1 = require("sequelize");
class FileRepository {
    addFile(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const contractExist = yield models_1.Contract.findOne({ where: { id: input.contractId } });
            if (!contractExist)
                throw new error_1.NotFoundError('contractId', { contract: ['Не удалось найти контракт'] });
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            const uploadedFiles = [];
            const transaction = yield database_1.default.transaction();
            for (const file of input.files) {
                const fixedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
                const fileExist = yield models_1.FileVolume.findOne({ where: { contractId: input.contractId, name: fixedName } });
                if (fileExist)
                    throw new error_1.ConflictError("Данное название уже занято");
            }
            try {
                // Обрабатываем все файлы параллельно
                for (const file of input.files) {
                    if (!file.buffer) {
                        throw new Error('File buffer is missing');
                    }
                    const bucketName = 'file-docs';
                    const objectName = `${Date.now()}-${(0, utils_1.getFileCode)()}`; // или ваш getFileCode()
                    const metaData = {
                        'Content-Type': file.mimetype,
                        'Original-Name': objectName
                    };
                    // Загружаем файл в MinIO
                    yield minio_1.minioClient.putObject(bucketName, objectName, file.buffer, file.buffer.length, metaData);
                    // Сохраняем метаданные в БД
                    const fixedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
                    yield models_1.FileVolume.create({
                        name: fixedName,
                        key: objectName,
                        contractId: input.contractId
                    }, { transaction });
                    uploadedFiles.push(objectName);
                }
                yield transaction.commit();
                return { success: true, files: uploadedFiles };
            }
            catch (error) {
                yield transaction.rollback();
                // Удаляем уже загруженные файлы из MinIO (опционально)
                if (uploadedFiles.length > 0) {
                    yield minio_1.minioClient.removeObjects('file-docs', uploadedFiles).catch(console.error);
                }
                console.log(error);
                throw new error_1.ConflictError(`Ошибка при загрузке файла(ов)`);
            }
        });
    }
    deleteFile(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const file = yield models_1.FileVolume.findOne({ where: { id: input.id } });
            if (!file) {
                throw new error_1.NotFoundError('file', { file: ['Файл не найден'] });
            }
            const contractExist = yield models_1.Contract.findOne({ where: { id: file.contractId } });
            if (!contractExist)
                throw new error_1.NotFoundError("Файл не найден");
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            const transaction = yield database_1.default.transaction();
            try {
                // Удаление из MinIO
                yield minio_1.minioClient.removeObject('file-docs', file.key);
                // Удаление из базы
                yield file.destroy({ transaction });
                yield transaction.commit();
                return file;
            }
            catch (error) {
                yield transaction.rollback();
                console.error('Ошибка при удалении файла:', error);
                throw new error_1.ConflictError('file', { file: ['Не удалось удалить файл'] });
            }
        });
    }
    getFiles(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchBy, searchValue, page = 1, limit = 10, sortBy = 'createdAt', sortType = 'ASC' } = input;
            try {
                const offset = (page - 1) * limit;
                // Создаем базовые условия запроса
                const where = {
                    contractId: input.contractId
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
                const result = yield models_1.FileVolume.findAndCountAll({
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
    getFile(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileExist = yield models_1.FileVolume.findOne({ where: { id: input.id } });
            if (!fileExist)
                throw new error_1.NotFoundError('Не удалось найти файл');
            const statExist = yield minio_1.minioClient.statObject('file-docs', fileExist.key);
            if (!statExist)
                throw new error_1.NotFoundError('Не удалось найти файл');
            const file = yield minio_1.minioClient.getObject('file-docs', fileExist.key);
            if (!file)
                throw new error_1.NotFoundError('Не удалось найти файл');
            return { stat: statExist, file };
        });
    }
    updateFile(input) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileExist = yield models_1.FileVolume.findOne({ where: { id: input.id } });
            if (!fileExist)
                throw new error_1.NotFoundError('Не удалось найти файл');
            const contractExist = yield models_1.Contract.findOne({ where: { id: fileExist.contractId } });
            if (!contractExist)
                throw new error_1.NotFoundError("Файл не найден");
            if (contractExist.status === "completed")
                throw new error_1.ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт");
            if (contractExist.status === 'canceled')
                throw new error_1.ConflictError('Нельзя провести транзакцию, так как контракт отменен');
            const fileExistName = yield models_1.FileVolume.findOne({ where: {
                    contractId: fileExist.contractId,
                    name: input.name
                } });
            if (fileExistName)
                throw new error_1.ConflictError('name', { "name": ['Данное название занято'] });
            fileExist.name = input.name;
            yield fileExist.save();
            return fileExist;
        });
    }
}
exports.FileRepository = FileRepository;

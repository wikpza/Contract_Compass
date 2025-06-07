import {FileRepositoryInterface} from "../interface/FileRepository.interface";
import {AddFileType, DeleteFileType, GetFileType, UpdateFileType} from "../models/File.model";
import {Applicant, Contract, Currency, FileVolume} from "../database/models";

import {minioClient} from "../database/minio";
import {getFileCode} from "../utils";
import {ConflictError, NotFoundError} from "../utils/error";
import {Stream} from "node:stream";
import {BucketItemStat} from "minio";
import sequelize from "../database";
import {Op} from "sequelize";

export class FileRepository implements FileRepositoryInterface{

    async addFile(input: AddFileType): Promise<{ success: boolean; files: string[] }> {

        const contractExist = await Contract.findOne({where:{id:input.contractId}})
        if(!contractExist) throw new NotFoundError('contractId', {contract:['Не удалось найти контракт']})

        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')

        const uploadedFiles: string[] = [];
        const transaction = await sequelize.transaction();

        for (const file of input.files) {
            const fixedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
            const fileExist = await FileVolume.findOne({where:{contractId:input.contractId, name:fixedName}})
            if(fileExist) throw new ConflictError("Данное название уже занято")
        }


        try {
            // Обрабатываем все файлы параллельно
            for (const file of input.files) {

                if (!file.buffer) {
                    throw new Error('File buffer is missing');
                }

                const bucketName = 'file-docs';
                const objectName = `${Date.now()}-${getFileCode()}`; // или ваш getFileCode()

                const metaData = {
                    'Content-Type': file.mimetype,
                    'Original-Name': objectName
                };

                // Загружаем файл в MinIO
                await minioClient.putObject(
                    bucketName,
                    objectName,
                    file.buffer,
                    file.buffer.length,
                    metaData
                );

                // Сохраняем метаданные в БД
                const fixedName = Buffer.from(file.originalname, 'latin1').toString('utf8');

                await FileVolume.create({
                    name: fixedName,
                    key: objectName,
                    contractId: input.contractId
                }, { transaction });

                uploadedFiles.push(objectName);
            }

            await transaction.commit();
            return { success: true, files: uploadedFiles };

        } catch (error) {
            await transaction.rollback();

            // Удаляем уже загруженные файлы из MinIO (опционально)
            if (uploadedFiles.length > 0) {
                await minioClient.removeObjects('file-docs', uploadedFiles).catch(console.error);
            }
            console.log(error)
            throw new ConflictError(`Ошибка при загрузке файла(ов)`);
        }
    }

    async deleteFile(input: DeleteFileType): Promise<FileVolume> {
        const file = await FileVolume.findOne({ where: { id: input.id } });

        if (!file) {
            throw new NotFoundError('file', { file: ['Файл не найден'] });
        }

        const contractExist = await Contract.findOne({where:{id:file.contractId}})
        if(!contractExist) throw new NotFoundError("Файл не найден");
        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')

        const transaction = await sequelize.transaction();

        try {
            // Удаление из MinIO
            await minioClient.removeObject('file-docs', file.key);

            // Удаление из базы
            await file.destroy({ transaction });

            await transaction.commit();
            return file;

        } catch (error) {
            await transaction.rollback();
            console.error('Ошибка при удалении файла:', error);
            throw new ConflictError('file', { file: ['Не удалось удалить файл'] });
        }
    }

    async getFiles(input: GetFileType): Promise<{count:number, rows:FileVolume[]}> {
        const {
            searchBy,
            searchValue,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortType = 'ASC'
        } = input;

        try {
            const offset = (page - 1) * limit;

            // Создаем базовые условия запроса
            const where: any = {
                contractId:input.contractId
            };

            // Добавляем условия поиска, если они указаны
            if (searchBy && searchValue) {
                if (Array.isArray(searchBy)) {
                    // Если searchBy - массив, ищем по нескольким полям
                    where[Op.or] = searchBy.map(field => ({
                        [field]: { [Op.like]: `%${searchValue}%` }
                    }));
                } else {
                    // Если searchBy - строка, ищем по одному полю
                    where[searchBy] = { [Op.like]: `%${searchValue}%` };
                }
            }

            // Выполняем запрос
            const result = await FileVolume.findAndCountAll({
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
        } catch (error) {
            console.error('Error fetching units:', error);
            throw error;
        }
    }

    async getFile(input: { id: number }): Promise<{file:Stream.Readable, stat: BucketItemStat}> {
        const fileExist = await FileVolume.findOne({where:{id:input.id}})
        if(!fileExist) throw new NotFoundError('Не удалось найти файл')

        const statExist = await minioClient.statObject('file-docs', fileExist.key);
        if(!statExist) throw new NotFoundError('Не удалось найти файл')

        const file = await minioClient.getObject('file-docs', fileExist.key)
        if(!file) throw new NotFoundError('Не удалось найти файл')

        return {stat:statExist, file}
    }

    async updateFile(input: UpdateFileType): Promise<FileVolume> {
        const fileExist = await FileVolume.findOne({where:{id:input.id}})
        if(!fileExist) throw new NotFoundError('Не удалось найти файл')

        const contractExist = await Contract.findOne({where:{id:fileExist.contractId}})
        if(!contractExist) throw new NotFoundError("Файл не найден");
        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')


        const fileExistName = await FileVolume.findOne({where:{
            contractId:
            fileExist.contractId,
                name:input.name
            }})
        if(fileExistName) throw new ConflictError('name', {"name":['Данное название занято']})

        fileExist.name = input.name
        await fileExist.save()

        return fileExist
    }



}
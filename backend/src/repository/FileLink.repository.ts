import {FileLinkRepositoryInterface} from "../interface/FileLink.repository.interface";
import {CreateFileLinkType, DeleteFileLinkType, GetFileLinkType, UpdateFileLinkType} from "../models/FileLink.model";
import {Applicant, Contract, FileLink} from "../database/models";
import {ConflictError, NotFoundError} from "../utils/error";
import sequelize from "../database";
import {Op} from "sequelize";

export class FileLinkRepository implements FileLinkRepositoryInterface{
    async createFileLink(input: CreateFileLinkType): Promise<FileLink> {
        const contractExist = await Contract.findOne({where:{id:input.contractId}})
        if(!contractExist) throw new NotFoundError('contractId', {contract:['Не удалось найти контракт']})

        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')


        const nameExist = await FileLink.findOne({where:{name:input.name, contractId:input.contractId}})
        if(nameExist) throw new ConflictError('name', {name:['Данное имя уже занято']})
        return await FileLink.create(
            {
                url:input.url,
                name:input.name,
                contractId:input.contractId
            }
        )

    }

    async deleteFileLink(input: DeleteFileLinkType): Promise<FileLink> {
        const transaction = await sequelize.transaction();
        // 1. Проверяем существование заявителя
        const fileLink = await FileLink.findOne({
            where: { id: input.id },
            transaction
        });


        if (!fileLink) {
            throw new NotFoundError('Не найдена ссылка', { 'id': ["Не найдена ссылка"] });
        }

        const contractExist = await Contract.findOne({where:{id:fileLink.contractId}})
        if(!contractExist) throw new NotFoundError('Не удалось найти Файл')

        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')


        // 3. Удаляем заявителя
        await fileLink.destroy({ transaction });

        // 4. Проверяем, что запись действительно удалена
        const verifyDeletion = await Applicant.findOne({
            where: { id: input.id },
            transaction
        });

        if (verifyDeletion) {
            throw new Error('Не удалось удалить ссылку');
        }

        await transaction.commit();
        return fileLink ;

    }

    async getFileLink(input: GetFileLinkType): Promise<{ rows: FileLink[]; count: number }> {
        const {
            searchBy,
            searchValue,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortType = 'ASC',
            contractId
        } = input;

        try {
            const offset = (page - 1) * limit;

            // Создаем базовые условия запроса
            const where: any = {
                contractId:contractId
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
            const result = await FileLink.findAndCountAll({
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

    async updateFileLink(input: UpdateFileLinkType): Promise<FileLink> {
        const fileExist = await FileLink.findOne({where:{id:input.id}})
        if(!fileExist) throw new NotFoundError('Не удалось найти ссылку')

        const contractExist = await Contract.findOne({where:{id:fileExist.contractId}})
        if(!contractExist) throw new NotFoundError('Не удалось найти Файл')

        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')


        if(fileExist.name === input.name && fileExist.url === input.url) throw new ConflictError('Вы ничего не изменили')

        if(input.name !== fileExist.name){
            const existName = await FileLink.findOne({where:{name:input.name, contractId:fileExist.contractId}})
            if(existName) throw new ConflictError('name', {name:['Данное имя уже занято']})
            fileExist.name = input.name
        }

        if(input.url !== fileExist.url) {
            fileExist.url = input.url
        }

        await fileExist.save()

        return fileExist
     }

}
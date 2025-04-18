import {Contract, Purchaser} from "../database/models";
import {Op} from "sequelize";
import {ConflictError, NotFoundError} from "../utils/error";
import sequelize from "../database";
import {
    CreateApplicantType,
    UpdateApplicantType
} from "../models/Applicant.model";
import {PurchaserRepositoryInterface} from "../interface/Purchaser.repository.interface";
import {CreatePurchaserType, DeletePurchaserType, GetPurchaserType} from "../models/Purchaser.model";

export class PurchaserRepository implements PurchaserRepositoryInterface{
    async createPurchaser(input: CreatePurchaserType): Promise<Purchaser> {
        const inputData:CreateApplicantType = {name:""}

        if(input.name && input.name !== "") inputData.name = input.name
        if(input.address && input.address !== "") inputData.address = input.address
        if(input.phone && input.phone !== "") inputData.phone = input.phone
        if(input.email && input.email !== "") inputData.email = input.email
        if(input.note && input.note !== "") inputData.note = input.note

        return await Purchaser.create(inputData)
    }

    async deletePurchaser(input: DeletePurchaserType): Promise<Purchaser> {
        const transaction = await sequelize.transaction();
        // 1. Проверяем существование заявителя
        const purchaser = await Purchaser.findOne({
            where: { id: input.id },
            transaction
        });

        if (!purchaser) {
            throw new NotFoundError('Не найден Закупщик', { 'id': ["Не найден Закупщик"] });
        }

        const contractExist = await Contract.findOne({where:{purchaserId:input.id}})
        if(contractExist) throw new ConflictError('Нельзя удалить, так как данный закупщик участвует в контракте ', contractExist.name)

        // 2. Сохраняем копию данных перед удалением
        const deletedApplicant = purchaser.get({ plain: true });

        // 3. Удаляем заявителя
        await purchaser.destroy({ transaction });

        // 4. Проверяем, что запись действительно удалена
        const verifyDeletion = await Purchaser.findOne({
            where: { id: input.id },
            transaction
        });

        if (verifyDeletion) {
            throw new Error('Не удалось удалить Закупщика');
        }

        await transaction.commit();
        return deletedApplicant as Purchaser;

    }

    async getPurchaser(input: GetPurchaserType): Promise<{ rows: Purchaser[]; count: number; }> {
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
            const where: any = {};

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
            const result = await Purchaser.findAndCountAll({
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

    async updatePurchaser(input: UpdateApplicantType): Promise<Purchaser> {

        const purchaserExist = await Purchaser.findOne({where:{id:input.id}})
        if(!purchaserExist) throw new NotFoundError('Не найден Закупщик', {'id':["Не найден Закупщик"]})

        if(input.name && input.name !== "") purchaserExist.name = input.name
        if(input.address && input.address !== "") purchaserExist.address = input.address
        if(input.phone && input.phone !== "") purchaserExist.phone = input.phone
        if(input.email && input.email !== "") purchaserExist.email = input.email
        if(input.note && input.note !== "") purchaserExist.note = input.note
        await purchaserExist.save()
        return await purchaserExist
    }


}
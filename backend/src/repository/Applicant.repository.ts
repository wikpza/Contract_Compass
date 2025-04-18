import {UnitRepositoryInterface} from "../interface/Unite.repository.interface";
import {CreateUnitType, DeleteUnitType, GetUnitType, UpdateUnitType} from "../models/unit.model";
import {Applicant, Contract, Unit} from "../database/models";
import {Op, Order} from "sequelize";
import {ConflictError, NotFoundError} from "../utils/error";
import sequelize from "../database";
import {ApplicantRepositoryInterface} from "../interface/Applicant.repository.interface";
import {
    CreateApplicantType,
    DeleteApplicantType,
    GetApplicantType,
    UpdateApplicantType
} from "../models/Applicant.model";
import ApplicantApi from "../api/Applicant.api";

export class ApplicantRepository implements ApplicantRepositoryInterface{
    async createApplicant(input: CreateApplicantType): Promise<Applicant> {
        const inputData:CreateApplicantType = {name:""}

        if(input.name && input.name !== "") inputData.name = input.name
        if(input.address && input.address !== "") inputData.address = input.address
        if(input.phone && input.phone !== "") inputData.phone = input.phone
        if(input.email && input.email !== "") inputData.email = input.email
        if(input.note && input.note !== "") inputData.note = input.note

        return await Applicant.create(inputData)
    }

    async deleteApplicant(input: DeleteApplicantType): Promise<Applicant> {
        const transaction = await sequelize.transaction();
        // 1. Проверяем существование заявителя
        const applicant = await Applicant.findOne({
            where: { id: input.id },
            transaction
        });

        if (!applicant) {
            throw new NotFoundError('Не найден Заявитель', { 'id': ["Не найден Заявитель"] });
        }

        const contractExist = await Contract.findOne({where:{applicantId:input.id}})
        if(contractExist) throw new ConflictError('Нельзя удалить, так как данный заявитель участвует в контракте ', contractExist.name)

        // 2. Сохраняем копию данных перед удалением
        const deletedApplicant = applicant.get({ plain: true });


        // 3. Удаляем заявителя
        await applicant.destroy({ transaction });

        // 4. Проверяем, что запись действительно удалена
        const verifyDeletion = await Applicant.findOne({
            where: { id: input.id },
            transaction
        });

        if (verifyDeletion) {
            throw new Error('Не удалось удалить заявителя');
        }

        await transaction.commit();
        return deletedApplicant as Applicant;

    }

    async getApplicant(input: GetApplicantType): Promise<{ rows: Applicant[]; count: number; }> {
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
            const result = await Applicant.findAndCountAll({
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

    async updateApplicant(input: UpdateApplicantType): Promise<Applicant> {

        const applicantExist = await Applicant.findOne({where:{id:input.id}})
        if(!applicantExist) throw new NotFoundError('Не найден Заявитель', {'id':["Не найден Заявитель"]})

        if(input.name && input.name !== "") applicantExist.name = input.name
        if(input.address && input.address !== "") applicantExist.address = input.address
        if(input.phone && input.phone !== "") applicantExist.phone = input.phone
        if(input.email && input.email !== "") applicantExist.email = input.email
        if(input.note && input.note !== "") applicantExist.note = input.note
        await applicantExist.save()
        return await applicantExist
    }


}
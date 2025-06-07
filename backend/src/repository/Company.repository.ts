import {UnitRepositoryInterface} from "../interface/Unite.repository.interface";
import {CreateUnitType, DeleteUnitType, GetUnitType, UpdateUnitType} from "../models/unit.model";
import {Applicant, Company, Contract, Unit} from "../database/models";
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
import {CompanyRepositoryInterface} from "../interface/Company.repository.interface";
import {CreateCompanyType, DeleteCompanyType, GetCompanyType, UpdateCompanyType} from "../models/Company.model";

export class CompanyRepository implements CompanyRepositoryInterface{
    async createCompany(input: CreateCompanyType): Promise<Company> {
        const nameExist = await Company.findOne({where:{name:input.name}})
        if(nameExist) throw new ConflictError('name', {name:['Данное имя уже занято']})

        const inputData:CreateCompanyType = {name:""}

        if(input.name && input.name !== "") inputData.name = input.name
        if(input.address && input.address !== "") inputData.address = input.address
        if(input.phone && input.phone !== "") inputData.phone = input.phone
        if(input.email && input.email !== "") inputData.email = input.email
        if(input.note && input.note !== "") inputData.note = input.note

        return await Company.create(inputData)
    }

    async deleteCompany(input: DeleteCompanyType): Promise<Company> {
        const transaction = await sequelize.transaction();
        // 1. Проверяем существование заявителя
        const company = await Company.findOne({
            where: { id: input.id },
            transaction
        });

        if (!company) {
            throw new NotFoundError('Не найдена Компания', { 'id': ["Не найден Компания"] });
        }

        const contractExist = await Contract.findOne({where:{companyId:input.id}})
        if(contractExist) throw new ConflictError('Нельзя удалить, так как данная компания участвует в контракте ', contractExist.name)

        // 2. Сохраняем копию данных перед удалением
        const deletedCompany = company.get({ plain: true });

        // 3. Удаляем заявителя
        await company.destroy({ transaction });

        // 4. Проверяем, что запись действительно удалена
        const verifyDeletion = await Company.findOne({
            where: { id: input.id },
            transaction
        });

        if (verifyDeletion) {
            throw new Error('Не удалось удалить Компанию');
        }

        await transaction.commit();
        return deletedCompany as Company;

    }

    async getCompany(input: GetCompanyType): Promise<{ rows: Company[]; count: number; }> {
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
            const result = await Company.findAndCountAll({
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
            console.error('Error fetching:', error);
            throw error;
        }
    }

    async updateCompany(input: UpdateCompanyType): Promise<Company> {

        const companyExist = await Company.findOne({where:{id:input.id}})
        if(!companyExist) throw new NotFoundError('Не найдена Компания', {'id':["Не найдена Компания"]})

        if(
            companyExist.name === input.name &&
            companyExist.address === input.address &&
            companyExist.phone === input.phone &&
            companyExist.email === input.email &&
            companyExist.note === input.note
        ) throw new ConflictError('Вы ничего не изменили')

        if(companyExist.name !== input.name){
            const nameCountExist = await Company.count({where:{name:input.name}})
            if(nameCountExist > 0) throw new ConflictError('name', {name:['Данное имя уже занято']})
            companyExist.name = input.name
        }

        if(input.address && input.address !== "") companyExist.address = input.address
        if(input.phone && input.phone !== "") companyExist.phone = input.phone
        if(input.email && input.email !== "") companyExist.email = input.email
        if(input.note && input.note !== "") companyExist.note = input.note
        await companyExist.save()
        return await companyExist
    }


}
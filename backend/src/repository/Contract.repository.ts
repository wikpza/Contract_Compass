import {ContractRepositoryInterface} from "../interface/Contract.repository.interface";
import {CreateContractType, DeleteContractType, GetContractType, UpdateContractType} from "../models/Contract.model";
import {
    Applicant,
    Company,
    Contract, ContractPaymentHistory,
    Currency, FileLink, FileVolume,
    Product,
    ProductInventory, ProductInventoryHistory,
    Project,
    Purchaser,
    Unit
} from "../database/models";
import {DataTypes, Op, Sequelize, where} from "sequelize";
import {ConflictError, NotFoundError, ValidationError} from "../utils/error";
import sequelize from "../database";

export class ContractRepository implements ContractRepositoryInterface{
    async createContract(input: CreateContractType): Promise<Contract> {

        const projectExist = await Project.findOne({where:{id:input.projectId}})
        if(!projectExist) throw new NotFoundError('projectId',{projectId:['Не удалось найти Проект']})

        const signDate = new Date(input.signDate)
        const officialBeginDate = new Date(input.officialBeginDate)
        const officialFinishDate = new Date(input.officialFinishDate)


        if(signDate > officialBeginDate) throw new ConflictError('signDate', {signDate:["Дата подписания контракта не может быть позже начала контракта"]})

        if(officialFinishDate < officialBeginDate) throw new ConflictError('officialFinishDate', {officialFinishDate:[ "Дата завершения контракта не может быть раньше начала контракта"]})

        if(projectExist.startDate > signDate) throw new ConflictError('signDate', {signDate:["Дата подписания контракта не может быть раньше начала проекта"]})

        if(projectExist.finishDate && officialFinishDate > projectExist.finishDate)
            throw new ConflictError('officialFinishDate', {
                officialFinishDate: ["Дата завершения контракта не может быть позже завершения проекта"]
            })

        const applicantExist = await Applicant.findOne({where:{id:input.applicantId}})
        if(!applicantExist) throw new NotFoundError('applicantId',{applicantId:['Не удалось найти Заявителя']})

        const purchaserExist = await Purchaser.findOne({where:{id:input.purchaserId}})
        if(!purchaserExist) throw new NotFoundError('purchaserId',{purchaserId:['Не удалось найти Закупщика']})

        const companyExist = await Company.findOne({where:{id:input.companyId}})
        if(!companyExist) throw new NotFoundError('companyId',{companyId:['Не удалось найти Компанию']})

        const currencyExist = await Currency.findOne({where:{id:input.currencyId}})
        if(!currencyExist) throw new NotFoundError('currencyId',{currencyId:['Не удалось найти Валюту']})


        const projectExistName = await Project.findOne({where:{name:input.name}})
        if(projectExistName) throw new ConflictError('name',{name:['Данное название уже занято']})

        const inputDate:CreateContractType =
            {
                type:input.type,
                name:input.name,
                projectId:projectExist.id,
                applicantId:applicantExist.id,
                purchaserId:purchaserExist.id,
                companyId:companyExist.id,
                currencyId:currencyExist.id,
                amount:input.amount,
                signDate:input.signDate,
                officialBeginDate:input.officialBeginDate,
                officialFinishDate:input.officialFinishDate,
            }


        if(input.note && input.note !== "") inputDate.note = input.note
        if(projectExist.currencyId !== input.currencyId) inputDate.projectCurrencyExchangeRate = input.projectCurrencyExchangeRate

        return await Contract.create(inputDate)
    }

    async deleteContract(input: DeleteContractType): Promise<Contract> {
        const { id } = input;

        return await sequelize.transaction(async (transaction) => {
            const toDelete = await Contract.findOne({
                where: { id },
                transaction,
            });

            if (!toDelete) throw new NotFoundError('id', { id: ["not found unit"] });

            const fileVolumeExist = await FileVolume.findOne({ where: { contractId: id }, transaction });
            if (fileVolumeExist) throw new ConflictError('Нельзя удалить, так как у контракта есть файлы');

            const fileLinkExist = await FileLink.findOne({ where: { contractId: id }, transaction });
            if (fileLinkExist) throw new ConflictError('Нельзя удалить, так как у контракта есть файлы-ссылки');

            // Найдём все записи ProductInventory, связанные с контрактом
            const inventories = await ProductInventory.findAll({
                where: { contractId: id },
                transaction,
            });

            // Удалим связанные ProductInventoryHistory
            for (const inventory of inventories) {
                await ProductInventoryHistory.destroy({
                    where: { productInventoryId: inventory.id },
                    transaction,
                });
            }

            // Удалим ProductInventory
            await ProductInventory.destroy({
                where: { contractId: id },
                transaction,
            });

            await ContractPaymentHistory.destroy({
                where: { contractId: id },
                transaction,
            });

            const deleteObj = { ...toDelete.get() };

            // Удалим контракт
            await toDelete.destroy({ transaction });

            return deleteObj;
        });
    }

    async getContract(input: GetContractType): Promise<{ rows: Contract[]; count: number }> {
        const {
            searchBy,
            searchValue,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortType = 'ASC',
            type,
            projectId
        } = input;

        try {
            const offset = (page - 1) * limit;

            // Создаем базовые условия запроса
            const where: any = {};

            if(projectId) where.projectId = projectId
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

            if(type && (type === 'service' || type === 'product')) where["type"] = type

            // Выполняем запрос
            const result = await Contract.findAndCountAll({
                where,
                order: [[sortBy, sortType]],
                include: [
                    { model: Applicant, attributes: ["id", "name"] },
                    { model: Purchaser, attributes: ["id", "name"] },
                    { model: Company, attributes: ["id", "name"] },
                    { model: Currency, attributes: ["id", "name", 'symbol', 'code'] },
                    { model: Project, attributes: ["id", "name"] },

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
        } catch (error) {
            console.error('Error fetching:', error);
            throw error;
        }
    }

    async updateContract(input: UpdateContractType): Promise<Contract> {
        const contractExist = await Contract.findOne({where:{id:input.id},
            include: [
                { model: Project, attributes: ["id", "name", "currencyId"],},
            ],
        })
        if(!contractExist) throw new NotFoundError('contractId', {contractId:['Контракт не найден']})


        if(contractExist.status === "completed") throw new ConflictError('Нельзя изменить данные о контракте, так как он завершен')
        if(contractExist.status === "canceled") throw new ConflictError('Нельзя изменить данные о контракте, так как он отменен')

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

        const signDate = new Date (input.signDate ).getTime()
        const officialBeginDate = new Date (input.officialBeginDate ).getTime()
        const officialFinishDate = new Date (input.officialFinishDate ).getTime()




        if(
            contractExist.type === input.type &&
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
            contractExist.note == input.note
        )throw new ConflictError('Вы ничего не изменили.')

        if(input.name !== contractExist.name){
            const contractNameCount = await Contract.count({where:{name:input.name}})
            if(contractNameCount > 0) throw new ConflictError('name', {name:['Данное название уже занято']})
            contractExist.name = input.name
        }



        if(contractExist.projectId !== input.projectId){
            const projectExist = await Project.findOne({where:{id:input.projectId}})
            if(!projectExist) throw new NotFoundError('projectId', {projectId:['Проект не найден']})
            contractExist.projectId = input.projectId
        }

        if(contractExist.applicantId !== input.applicantId){
            const applicantExist = await Applicant.findOne({where:{id:input.applicantId}})
            if(!applicantExist) throw new NotFoundError('applicantId', {applicantId:['Заявитель не найден']})
            contractExist.applicantId = input.applicantId
        }

        if(contractExist.purchaserId !== input.purchaserId){
            const purchaserExist = await Purchaser.findOne({where:{id:input.purchaserId}})
            if(!purchaserExist) throw new NotFoundError('purchaserId', {purchaserId:['Закупщик не найден']})
            contractExist.purchaserId = input.purchaserId
        }

        if(contractExist.companyId !== input.companyId){
            const companyExist = await Company.findOne({where:{id:input.companyId}})
            if(!companyExist) throw new NotFoundError('companyId', {companyId:['Компания не найдена']})
            contractExist.companyId = input.companyId
        }

        if(contractExist.amount !== input.amount){
            contractExist.amount = input.amount
        }

        if(contractExist.type !== input.type && (input.type === "product" || input.type === 'service')){
            // LOgica check lsjfljslfjasdf;l
            contractExist.type = input.type
        }

        if(contractExist.currencyId !== input.currencyId){
            const currencyExist = await Currency.findOne({where:{id:input.currencyId}})
            if(!currencyExist) throw new NotFoundError('currencyId', {currencyId:['Валюта не найдена']})

            if(contractExist?.project?.currencyId !== input.currencyId){
                if(!input.projectCurrencyExchangeRate) throw new ValidationError('Вы не определили курс валюты к ')
                contractExist.projectCurrencyExchangeRate = input.projectCurrencyExchangeRate
            }else{
                contractExist.projectCurrencyExchangeRate = 1
            }
            contractExist.currencyId = input.currencyId
        }




        if(contractExist.officialBeginDate.getTime() !== officialBeginDate
            ||
            contractExist.officialFinishDate.getTime() !== officialFinishDate
            ||
            contractExist.signDate.getTime() !== signDate
        ){
            if(officialBeginDate < signDate) throw new ConflictError('Дата начала контракта не может быть раньше подписания', {officialBeginDate:['Дата начала контракта не может быть раньше подписания']})

            if(officialBeginDate > officialFinishDate) throw new ConflictError('Дата завершения не может быть раньше даты начала', {officialBeginDate:['Дата завершения не может быть раньше даты начала']})

            const projectExist = await Project.findOne({where:{id:contractExist.projectId}})
            if(!projectExist) throw new NotFoundError('Не удалось найти Контракт')


            if(projectExist.startDate.getTime() > signDate) throw new ConflictError('signDate', {signDate:["Дата подписания контракта не может быть раньше начала проекта"]})

            if(projectExist.finishDate && officialFinishDate > projectExist.finishDate.getTime())
                throw new ConflictError('officialFinishDate', {
                    officialFinishDate: ["Дата завершения контракта не может быть позже завершения проекта"]
                })


            if(contractExist.officialBeginDate.getTime() !== officialBeginDate){
                contractExist.officialBeginDate = new Date(input.officialBeginDate)
            }

            if(contractExist.officialFinishDate.getTime() !== officialFinishDate){
                contractExist.officialFinishDate = new Date(input.officialFinishDate)
            }

            if(contractExist.signDate.getTime() !== signDate){
                contractExist.signDate = new Date(input.signDate)
            }

        }


        if(input.note != contractExist.note){
            contractExist.note = input.note
        }

        await contractExist.save()
        return contractExist
    }

    async getContractDetail(input: { id: number }): Promise<Contract> {
        const contractExist = await Contract.findOne({
            where:{id:input.id},
            include: [
                { model: Applicant, attributes: ["id", "name", 'email', 'phone'] },
                { model: Purchaser, attributes: ["id", "name", 'email', 'phone'] },
                { model: Company, attributes: ["id", "name", 'email', 'phone'] },
                { model: Currency, attributes: ["id", "name", 'symbol', 'code'] },
                { model: Project, attributes: ["id", "name", "note"] },

            ],
        });
        if(!contractExist) throw new NotFoundError('id', {id:['Не удалось найти контракт']})
        return contractExist
    }

    async changeStatus(input: { id: number; status: string }): Promise<Contract> {
        const contractExist = await Contract.findOne({where:{id:input.id}})
        if(!contractExist) throw new NotFoundError('Не удалось найти контракт')

        if(input.status === contractExist.status) throw new ConflictError("Вы ничего не изменили")

        if(input.status === 'active' || input.status === "canceled"){
            contractExist.status = input.status
            await contractExist.save()
            return contractExist
        }

        if(contractExist.giveAmount !== contractExist.amount)throw new ConflictError('Вы не выплатили всю сумму по контракту')

        if(contractExist.type === 'product'){
            const productContract = await ProductInventory.findAll({
                where: {
                    contractId: contractExist.id,
                    contractQuantity: {
                        [Op.gt]: Sequelize.col('takeQuantity')
                    }
                }
            });
            if (productContract.length > 0) throw new ConflictError('Не все товары были получены')
        }

        contractExist.officialFinishDate = new Date()
        contractExist.status = 'completed'
        await contractExist.save()

        return contractExist
    }

}
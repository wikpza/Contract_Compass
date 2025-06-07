import {PaymentRepositoryInterface} from "../interface/Payment.repository.interface";
import {CancelPaymentType, CreatePaymentType, GetPaymentType} from "../models/Payment.model";
import {Applicant, Company, Contract, ContractPaymentHistory, Currency, Project, Purchaser} from "../database/models";
import {Op, where} from "sequelize";
import {APIError, ConflictError, NotFoundError} from "../utils/error";
import sequelize from "../database";

export class PaymentRepository implements PaymentRepositoryInterface{
    async cancelPayment(input: CancelPaymentType): Promise<ContractPaymentHistory> {
        const contractPaymentExist = await ContractPaymentHistory.findOne({where:{id:input.id}, include:[{model:Contract, attributes:['amount', 'giveAmount','currencyId']}]})
        if(!contractPaymentExist) throw new NotFoundError('Не удалось найти Транзакцию')

        if(contractPaymentExist.type === 'canceled') throw new ConflictError('Транзакция уже имеет статус отмененный')

        let contractPaymentAmount = contractPaymentExist.amount
        if(contractPaymentExist.currencyId !== contractPaymentExist.contract.currencyId) contractPaymentAmount = contractPaymentAmount * contractPaymentExist.contractCurrencyExchangeRate

        if(contractPaymentExist.type === 'issued' && contractPaymentAmount > contractPaymentExist.contract.giveAmount) throw new ConflictError('Конечная сумма взноса не может быть меньше нуля')
        if(contractPaymentExist.type === 'refund' && (contractPaymentAmount + contractPaymentExist.contract.giveAmount) > contractPaymentExist.contract.amount) throw new ConflictError('Конечная сумма взноса не может быть больше сумма контракта')

        const contractExist = await Contract.findOne({where:{id:contractPaymentExist.contractId}})
        if(!contractExist) throw new NotFoundError('Не удалось найти контракт')

        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')


        const transaction = await sequelize.transaction();

        console.log(contractPaymentExist)
        try {
            if (contractPaymentExist.type === 'issued') {
                contractExist.giveAmount = contractPaymentExist.contract.giveAmount - contractPaymentAmount
            } else {
                contractExist.giveAmount = contractPaymentExist.contract.giveAmount + contractPaymentAmount
            }

            contractPaymentExist.type = 'canceled'
            await contractExist.save({transaction})
            await contractPaymentExist.save({transaction})
            await transaction.commit();
            return contractPaymentExist
        } catch (error) {
            await transaction.rollback();
            console.error('Transaction failed:', error);
            throw new APIError("Отмена не прошла, попробуйте позже")
        }
    }

    async createPayment(input: CreatePaymentType): Promise<ContractPaymentHistory> {
        const contractExist = await Contract.findOne({where:{id:input.contractId},
            include:[{model:Currency, attributes:['code']}]
        })
        if(!contractExist) throw new NotFoundError("id" , {id:['Не удалось найти Контракт']})
        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')

        if(input.type === 'issued' && contractExist.giveAmount >= contractExist.amount) throw new ConflictError('amount',{amount:['Нельзя провести транзакцию, так как уже внесена вся сумма']} )

        const currencyExist = await Currency.findOne({where:{id:input.currencyId},
        })
        if(!currencyExist) throw new NotFoundError("id" , {id:['Не удалось найти Валюту']})

        console.log(typeof input.giveDate )

        const inputData:CreatePaymentType = {
            type:input.type,
            contractId:input.contractId,
            currencyId:input.currencyId,
            amount:input.amount,
            giveDate:input.giveDate
        }
        let takeAmount = input.amount

        if(contractExist.currencyId !== input.currencyId){
            if(!input.contractCurrencyExchangeRate) throw new NotFoundError('contractCurrencyExchangeRate', {contractCurrencyExchangeRate:[`Вы не определили курс Валюты ${contractExist?.currency?.code} - ${currencyExist.code}`]})
            takeAmount = input.amount * input.contractCurrencyExchangeRate
            inputData.contractCurrencyExchangeRate = input.contractCurrencyExchangeRate
        }

        if(input?.note && input?.note !== "") inputData.note = input.note

        const totalGiveAmount = contractExist.giveAmount + takeAmount

        if(input.type ==='issued' && totalGiveAmount > contractExist.amount) throw new ConflictError('amount', {amount:"Вы уже превысили сумму контракта"})
        if(input.type ==='refund' && contractExist.giveAmount < input.amount) throw new ConflictError('amount', {amount:"Конечная выданная сумма не может быть меньше нуля"})

        const transaction = await sequelize.transaction();
        try {
            const newPaymentHistory = await ContractPaymentHistory.create(inputData, { transaction });

            if(input.type === 'issued') contractExist.giveAmount = totalGiveAmount
            else contractExist.giveAmount = contractExist.giveAmount - takeAmount

            await contractExist.save({transaction})
            await transaction.commit();
            return newPaymentHistory
        } catch (error) {
            await transaction.rollback();
            console.error('Transaction failed:', error);
            throw new APIError("Оплата не прошла, попробуйте позже")
        }

    }

    async getPayment(input: GetPaymentType): Promise<{ rows: ContractPaymentHistory[]; count: number }> {
        const {
            searchBy,
            searchValue,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortType = 'ASC',
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
            const result = await ContractPaymentHistory.findAndCountAll({
                where,
                order: [[sortBy, sortType]],
                include:[{model:Currency, attributes:['name', 'id', 'code', 'symbol']}],
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

    async finishPayment(input: { contractId: number, giveDate:Date, note?:string }): Promise<ContractPaymentHistory> {
        const contractExist = await Contract.findOne({where:{id:input.contractId},
            include:[{model:Currency, attributes:['code']}]
        })
        if(!contractExist) throw new NotFoundError("id" , {id:['Не удалось найти Контракт']})
        if(contractExist.status === "completed" ) throw new ConflictError('Нельзя провести транзакцию, так как контракт уже закрыт')
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')

        if(contractExist.giveAmount == contractExist.amount) throw new ConflictError('amount',{amount:['Нельзя провести транзакцию, так как уже внесена вся сумма']} )

        const  giveAmount = contractExist.amount - contractExist.giveAmount

        const inputData:CreatePaymentType = {
            type:"issued",
            contractId:input.contractId,
            currencyId:contractExist.currencyId,
            amount:giveAmount,
            giveDate:input.giveDate
        }

        if(input?.note && input?.note !== "") inputData.note = input.note

        const transaction = await sequelize.transaction();
        try {
            const newPaymentHistory = await ContractPaymentHistory.create(inputData, { transaction });
            contractExist.giveAmount = contractExist.amount
            await contractExist.save({transaction})
            await transaction.commit();
            return newPaymentHistory
        } catch (error) {
            await transaction.rollback();
            console.error('Transaction failed:', error);
            throw new APIError("Оплата не прошла, попробуйте позже")
        }

    }

}
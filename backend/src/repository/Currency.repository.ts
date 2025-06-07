import {CurrencyRepositoryInterface} from "../interface/Currency.repository.interface";
import {CreateCurrencyType, DeleteCurrencyType, GetCurrencyType, UpdateCurrencyType} from "../models/Currency.model";
import {Currency, Product, Unit} from "../database/models";
import {ConflictError, NotFoundError} from "../utils/error";
import {Op} from "sequelize";

export class CurrencyRepository implements CurrencyRepositoryInterface{
    async createCurrency(input: CreateCurrencyType): Promise<Currency> {
        const currencyExistName = await Currency.findOne({where:{name:input.name}})
        if(currencyExistName) throw new ConflictError('name', {name:['Данное название уже занято']})

        const currencyExistSymbol = await Currency.findOne({where:{symbol:input.symbol}})
        if(currencyExistSymbol) throw new ConflictError('symbol', {symbol:['Данный символ уже занят']})

        const currencyExistCode = await Currency.findOne({where:{code:input.code}})
        if(currencyExistCode) throw new ConflictError('code', {code:['Данный код уже занят']})


        return await Currency.create({
            name:input.name,
            code:input.code,
            symbol:input.symbol
        })
    }

    async deleteCurrency(input: DeleteCurrencyType): Promise<Currency> {
        const { id } = input;

        const toDelete = await Currency.findOne({
            where: { id }
        });

        if (!toDelete)  throw new NotFoundError('id', {id:["Не удалось найти валюту"]})

        // const productExist = await Product.findOne({where:{unitId:input.id,}})
        // if(productExist) throw new ConflictError('Нельзя удалить, так как данная Единица измерения используется в продукте ', productExist.name)


        const deletedCurrency = { ...toDelete.get() };
        await toDelete.destroy();

        return deletedCurrency
    }

    async getCurrency(input: GetCurrencyType): Promise<{ rows: Currency[]; count: number }> {
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
            const result = await Currency.findAndCountAll({
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

    async updateCurrency(input: UpdateCurrencyType): Promise<Currency> {
        const currencyExist = await Currency.findOne({where:{id:input.id}})
        if(!currencyExist) throw new NotFoundError('id', {id:['не удалось найти валюту']})

        const currencyExistName = await Currency.findOne({where:{name:input.name}})
        if(currencyExistName && (currencyExist.name !== input.name)) throw new ConflictError('name', {name:['Данное название уже занято']})

        const currencyExistSymbol = await Currency.findOne({where:{symbol:input.symbol}})
        if(currencyExistSymbol && (currencyExist.symbol !== input.symbol) ) throw new ConflictError('symbol', {symbol:['Данный символ уже занят']})

        const currencyExistCode = await Currency.findOne({where:{code:input.code}})
        if(currencyExistCode && (currencyExist.code !== input.code)) throw new ConflictError('code', {code:['Данный код уже занят']})

        currencyExist.name = input.name
        currencyExist.symbol = input.symbol
        currencyExist.code = input.code
        await currencyExist.save()
        return currencyExist
    }

}
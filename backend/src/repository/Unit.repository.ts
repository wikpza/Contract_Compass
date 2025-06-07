import {UnitRepositoryInterface} from "../interface/Unite.repository.interface";
import {CreateUnitType, DeleteUnitType, GetUnitType, UpdateUnitType} from "../models/unit.model";
import {Contract, Product, ProductInventory, Unit} from "../database/models";
import {Op, Order} from "sequelize";
import {ConflictError, NotFoundError} from "../utils/error";
import sequelize from "../database";

export class UnitRepository implements UnitRepositoryInterface{
    async createUnit(input: CreateUnitType): Promise<Unit> {
        const unitExistNameCount = await Unit.count({where:{name:input.name}})
        if(unitExistNameCount > 0) throw new ConflictError('name', {name:['Такое название уже занято']})

        const unitExistSymbolCount = await Unit.count({where:{symbol:input.symbol}})
        if(unitExistSymbolCount > 0) throw new ConflictError('symbol', {symbol:['Такая аббревиатура уже занята']})

        return await Unit.create(
            {
                name:input.name,
                symbol:input.symbol
            }
        )

    }

    async deleteUnit(input: DeleteUnitType): Promise<Unit> {

        const { id } = input;

        const unitToDelete = await Unit.findOne({
            where: { id }
        });

        if (!unitToDelete)  throw new NotFoundError('id', {id:["not found unit"]})

        const productExist = await Product.findOne({where:{unitId:input.id,}})
        if(productExist) throw new ConflictError('Нельзя удалить, так как данная Единица измерения используется в продукте ', productExist.name)


        const deletedUnit = { ...unitToDelete.get() };
        await unitToDelete.destroy();

        return deletedUnit as Unit;

    }

    async getUnit(input: GetUnitType): Promise<{ rows: Unit[]; count: number; }> {
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
            const result = await Unit.findAndCountAll({
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

    async updateUnit(input: UpdateUnitType): Promise<Unit> {
        const unitExisted = await Unit.findOne({where:{id:input.id}})
        if(!unitExisted) throw new NotFoundError('id', {id:["Не была найдена Единица измерения"]})
        let hasChange = false;

        if(unitExisted.name !== input.name){
            const unitExistNameCount = await Unit.count({where:{name:input.name}})
            if(unitExistNameCount > 0) throw new ConflictError('name', {name:['Такое название уже занято']})
            unitExisted.name = input.name
            hasChange = true
        }

        if(unitExisted.symbol !== input.symbol){
            const unitExistSymbolCount = await Unit.count({where:{symbol:input.symbol}})
            if(unitExistSymbolCount > 0 ) throw new ConflictError('symbol', {symbol:['Такая аббревиатура уже занята']})
            unitExisted.symbol = input.symbol
            hasChange = true
        }

        if(!hasChange) throw new ConflictError('Не было внесено изменений')

        await unitExisted.save()
        return unitExisted
    }

}
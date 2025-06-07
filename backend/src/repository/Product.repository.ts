import {ProductRepositoryInterface} from "../interface/Product.repository.interface";
import {CreateProductType, DeleteProductType, GetProductType, UpdateProductType} from "../models/Product.model";
import {Company, Contract, Product, ProductInventory, Unit} from "../database/models";
import {Op} from "sequelize";
import {ConflictError, NotFoundError} from "../utils/error";

export class ProductRepository implements ProductRepositoryInterface{
    async createProduct (input: CreateProductType): Promise<Product> {
        const unitExist = await Unit.findOne({where:{id:input.unitId}})
        if(!unitExist) throw new ConflictError('unitId', {name:['Не была найдена такая единица измерения']})

        const productExistName = await Product.count({where:{name:input.name}})
        if(productExistName > 0) throw new ConflictError('name', {name:['Такое название уже занято']})

        return await Product.create({
            name:input.name,
            unitId:input.unitId,
            note:input?.note || null
        })
    }

    async deleteProduct(input: DeleteProductType): Promise<Product> {
        const { id } = input;

        const toDelete = await Product.findOne({
            where: { id }
        });

        if (!toDelete)  throw new NotFoundError('id', {id:["not found unit"]})

        const productInventoryExist = await ProductInventory.findOne({where:{productId:input.id,},  include: [{ model: Contract, attributes: ["id", "name"] }],})
        if(productInventoryExist) throw new ConflictError('Нельзя удалить, так как данный продукт используется в контракте ', productInventoryExist?.contract ? productInventoryExist.contract.name : "")

        const deleteObj = { ...toDelete.get() };
        await toDelete.destroy();

        return deleteObj ;
    }

    async getProduct(input: GetProductType): Promise<{ rows: Product[]; count: number }> {
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
            const result = await Product.findAndCountAll({
                where,
                order: [[sortBy, sortType]],
                limit,
                offset,
                include: [{ model: Unit, attributes: ["id", "name", 'symbol'] }],
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

    async updateProduct(input: UpdateProductType): Promise<Product> {
        const productExist = await Product.findOne({where:{id:input.id}})
        if(!productExist) throw new NotFoundError('id', {id:["Не был найден продукт"]})

        if(
            productExist.name === input.name &&
            productExist.unitId === input.unitId &&
            productExist.note === input.note
        ) throw new ConflictError('Вы ничего не изменили')

        if(productExist.unitId !== input.unitId){
            const unitExist = await Unit.count({where:{id:input.unitId}})
            if(!unitExist) throw new ConflictError('unitId', {name:['Не была найдена такая единица измерения']})
            productExist.unitId = input.unitId
        }

        if(productExist.name !== input.name){
            const productExistNameCount = await Product.count({where:{name:input.name}})
            if(productExistNameCount > 0 && (productExist.name !== input.name)) throw new ConflictError('name', {name:['Такое название уже занято']})
            productExist.name = input.name
        }

        if(input.note && input.note !== "") productExist.note = input.note


        return await productExist.save()
    }

}
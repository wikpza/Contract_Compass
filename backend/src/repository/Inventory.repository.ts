import {InventoryRepositoryInterface} from "../interface/Inventory.repository.interface";
import {
    AddInventorySessionType,
    AddProductContractType, DeleteProductContractType,
    GetInventoryHistoryType,
    GetProductContractType, UpdateProductContractType
} from "../models/Inventory.model";
import {
    Applicant,
    Contract,
    ContractPaymentHistory,
    Product,
    ProductInventory,
    ProductInventoryHistory,
    Unit
} from "../database/models";
import {col, fn, Op} from "sequelize";
import {APIError, ConflictError, NotFoundError} from "../utils/error";
import sequelize from "../database";

export class InventoryRepository implements InventoryRepositoryInterface{
    async addInventoryProduct(input: AddInventorySessionType): Promise<ProductInventoryHistory> {
        const inventoryExist = await ProductInventory.findOne({where:{id:input.id}})
        if(!inventoryExist) throw new NotFoundError("Не удалось найти товар")

        if(input.type === 'issued' && (input.amount + inventoryExist.takeQuantity) > inventoryExist.contractQuantity) throw new ConflictError('amount', {amount:['Полученное количество не может превышать количества по контракту']})
        if(input.type === 'refund' && (inventoryExist.takeQuantity - input.amount) < 0) throw new ConflictError('amount', {amount:['Полученное количество не может меньше нуля']})


        const inputData: {type:string, amount:number, productInventoryId:number, giveDate:Date, note?:string, quantity:number} = {
            type: input.type,
            amount:input.amount,
            giveDate:input.giveDate,
            productInventoryId:input.id,
            quantity:input.id
        }
        if(input?.note && input?.note !== "") inputData.note = input.note


        const contractExist = await Contract.findOne({where:{id:inventoryExist.contractId}})
        if(!contractExist) throw new NotFoundError('Не удалось найти контракт')

        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')


        const transaction = await sequelize.transaction();
        try {
            const newInventoryHistory = await ProductInventoryHistory.create(inputData, { transaction });

            if(input.type === 'issued') inventoryExist.takeQuantity = inventoryExist.takeQuantity + input.amount
            else inventoryExist.takeQuantity = inventoryExist.takeQuantity - input.amount

            await inventoryExist.save({transaction})
            await transaction.commit();
            return newInventoryHistory
        } catch (error) {
            await transaction.rollback();
            console.error('Transaction failed:', error);
            throw new APIError("Получение не удалось")
        }

        return Promise.resolve({} as ProductInventoryHistory);
    }

    async addProductContract(input: AddProductContractType): Promise<ProductInventory> {
        const productInventoryExist = await ProductInventory.findOne({where:{productId:input.productId, contractId:input.contractId}})
        if(productInventoryExist) throw new ConflictError('contractId',{contractId:['Продукт уже был добавлен']})

        const productExist = await Product.findOne({where:{id:input.productId}})
        if(!productExist) throw new NotFoundError('productId', {productId:['Не удалось найти продукт']})

        const contractExist = await Contract.findOne({where:{id:input.contractId}})
        if(!contractExist) throw new NotFoundError('contractId', {contractId:['Не удалось найти контракт']})

        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')


        const inputData:AddProductContractType = {
            productId: input.productId,
            contractId: input.contractId,
            contractQuantity: input.contractQuantity }

        if(input?.note && input.note !== "") inputData.note = input.note

        return await ProductInventory.create(inputData)
    }

    async getInventory(input: GetProductContractType): Promise<{ rows: ProductInventory[]; count: number; totalCount:number, lastCount:number }> {
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
            const where: any = {contractId:input.contractId};

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
            const result = await ProductInventory.findAndCountAll({
                where,
                order: [[sortBy, sortType]],
                include:[
                    {model:Product,include:[{model:Unit}]},
                    {model:Contract}
                ],
                limit,
                offset,
                // Для MSSQL нужно добавить distinct: true при использовании findAndCountAll с limit/offset
                distinct: true
            });

            const result1 = await ProductInventory.findAll({
                where: {
                    contractId: input.contractId,
                },
                attributes: [
                    [fn('SUM', col('contractQuantity')), 'contractQuantity'],
                    [fn('SUM', col('takeQuantity')), 'takeQuantity'],
                ],
                raw: true,
            });

            result1[0]?.contractQuantity

            return {
                rows: result.rows,
                count: result.count,
                totalCount:result1[0]?.contractQuantity | 0,
                lastCount:(result1[0]?.contractQuantity | 0)  - (result1[0]?.takeQuantity | 0)
            };
        } catch (error) {
            console.error('Error fetching units:', error);
            throw error;
        }
    }

    async getInventoryHistory(input: GetInventoryHistoryType): Promise<{ rows: ProductInventoryHistory[]; count: number }> {
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
                productInventoryId:input.contractId
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
            const result = await ProductInventoryHistory.findAndCountAll({
                where,
                order: [[sortBy, sortType]],
                include:[
                    {model:ProductInventory,
                        include:[
                            {model:Product, include:[{model:Unit}]},

                        ]
                    },
                ],
                limit,
                offset,
                // Для MSSQL нужно добавить distinct: true при использовании findAndCountAll с limit/offset
                distinct: true
            });

            return {
                rows: result.rows,
                count: result.count,
            };
        } catch (error) {
            console.error('Error fetching units:', error);
            throw error;
        }
    }

    async deleteInventory(input: DeleteProductContractType): Promise<ProductInventory> {
        const inventoryExist = await ProductInventory.findOne({ where: { id: input.id } });
        if (!inventoryExist) throw new NotFoundError('Не удалось найти товар');

        const contractExist = await Contract.findOne({where:{id:inventoryExist.contractId}})
        if(!contractExist) throw new NotFoundError('Не удалось найти контракт')

        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')


        const transaction = await sequelize.transaction();
        try {

            await ProductInventoryHistory.destroy({
                where: { productInventoryId: input.id },
                transaction
            });

            await ProductInventory.destroy({
                where: { id: input.id },
                transaction
            });

            await transaction.commit();
            return inventoryExist;
        } catch (error) {
            await transaction.rollback();
            console.error('Transaction failed:', error);
            throw new APIError("Не удалось удалить");
        }
    }

    async updateInventory(input: UpdateProductContractType): Promise<ProductInventory> {
        const inventoryExist = await ProductInventory.findOne({where:{id:input.id}})
        if(!inventoryExist) throw new NotFoundError('id', {id:['Не удалось найти товар']})

        const contractExist = await Contract.findOne({where:{id:inventoryExist.contractId}})
        if(!contractExist) throw new NotFoundError('Не удалось найти контракт')

        if(contractExist.status === "completed" ) throw new ConflictError("Нельзя провести транзакцию, так как контракт уже закрыт")
        if(contractExist.status === 'canceled') throw new ConflictError('Нельзя провести транзакцию, так как контракт отменен')


        if(inventoryExist.takeQuantity > input.contractQuantity) throw new ConflictError('contractQuantity', {contractQuantity:['Количество по контракту не может быть меньше полученного количества']})

        inventoryExist.contractQuantity = input.contractQuantity
        await inventoryExist.save()
        return inventoryExist
    }

}
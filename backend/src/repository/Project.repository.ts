import {ProjectRepositoryInterface} from "../interface/Project.repository.inteface";
import {
    CreateProjectType,
    DeleteProjectType,
    GetProjectDetailType,
    GetProjectType, UpdateProjectStatusType,
    UpdateProjectType
} from "../models/Project.model";
import {AccessLink, Contract, Currency, ProductInventory, Project} from "../database/models";
import {Error, Op, QueryTypes, where} from "sequelize";
import {BaseError, ConflictError, NotFoundError} from "../utils/error";
import sequelize from "../database";
import {callbackify} from "node:util";
import {checkSQLErrorMessage} from "../utils/errors";
import {response} from "express";

export class ProjectRepository implements ProjectRepositoryInterface{
    async createProject(input: CreateProjectType): Promise<Project> {
        const projectNameExist = await Project.count({where:{name:input.name}})
        if(projectNameExist > 0) throw new ConflictError('name', {name:["Данное название уже занято"]})

        if(input.finishDate <= input.startDate) throw new ConflictError('finishDate', {name:["Дата окончания не может быть раньше чем начало"]})

        const inputData:CreateProjectType =
            {name:input.name,
            currencyId:input.currencyId,
            startDate:input.startDate,
            finishDate:input.finishDate,}

        if(input.note && input.note !== "") inputData.note = input.note


        return await Project.create(inputData)
    }

    async deleteProject(input: DeleteProjectType): Promise<Project> {
        const { id } = input;

        const toDelete = await Project.findOne({
            where: { id }
        });

        if (!toDelete)  throw new NotFoundError('id', {id:["Не найден Проект"]})

        const contractExist = await Contract.findOne({where:{projectId:input.id}})
        if(contractExist) throw new ConflictError('Нельзя удалить, так как он имеет контракты')

        const accessLinkExist = await AccessLink.findOne({where:{projectId:input.id}})
        if(accessLinkExist) throw new ConflictError('Нельзя удалить, так как есть ссылка доступа')

        const deletedProject = { ...toDelete.get() };
        await toDelete.destroy();

        return deletedProject
    }

    async getProject(input: GetProjectType): Promise<{ rows: Project[]; count: number }> {
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
            const result = await Project.findAndCountAll({
                where,
                order: [[sortBy, sortType]],
                limit,
                offset,
                include: [{ model: Currency, attributes: ["id", "name", 'symbol', "code"] }],
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

    async updateProject(input: UpdateProjectType): Promise<Project> {
        const projectExist = await Project.findOne({where:{id:input.id}})
        if(!projectExist) throw new NotFoundError('id', {id:['Проект не был найден']})

        if(!projectExist.status) throw new ConflictError('Нельзя изменить данные, так как проект завершен')

        const officialBeginDate = new Date (input.startDate).getTime()
        const officialFinishDate = new Date (input.finishDate ).getTime()

        if(
            projectExist.name === input.name &&
            projectExist.startDate.getTime() === officialBeginDate &&
            projectExist.finishDate.getTime() === officialFinishDate &&
            projectExist.currencyId == input.currencyId &&
            projectExist.note == input.note
        )throw new ConflictError('Вы ничего не изменили.')


        if(projectExist.name !== input.name){
            const projectExistNameCount = await Project.count({where:{name:input.name}})
            if(projectExistNameCount > 0) throw new ConflictError('name', {name:['Такое название уже занято']})
            projectExist.name = input.name
        }

        if(input.currencyId !== projectExist.currencyId){
            const contractCount = await Contract.count({where:{projectId:projectExist.id}})
            if(contractCount > 0) throw new ConflictError('currencyId', {currencyId:['Нельзя изменить Валюту проекта, так как есть контракты']})

            const currencyExist = await Currency.findOne({where:{id:input.currencyId}})
            if(!currencyExist) throw new NotFoundError('currencyId', {currencyId:['Не удалось найти валюту']})
            projectExist.currencyId = input.currencyId
        }

        if (projectExist.startDate.getTime() !== officialBeginDate ||
            projectExist.finishDate.getTime() !== officialFinishDate) {

            // Проверяем, что новая дата начала не позже новой даты окончания
            if (officialBeginDate > officialFinishDate) {
                throw new ConflictError('date', {
                    startDate: ['Дата начала не может быть позже даты окончания'],
                    finishDate: ['Дата окончания не может быть раньше даты начала']
                });
            }

            // Проверяем, что все контракты проекта входят в новый период
            const contracts = await Contract.findAll({
                where: {
                    projectId: projectExist.id,
                    [Op.or]: [
                        { signDate: { [Op.lt]: new Date(input.startDate) } },
                        { officialFinishDate: { [Op.gt]: new Date(input.finishDate) } }
                    ]
                }
            });

            if (contracts.length > 0) {
                throw new ConflictError('date', {
                    startDate: ['Некоторые контракты выходят за рамки нового периода проекта'],
                    finishDate: ['Некоторые контракты выходят за рамки нового периода проекта']
                });
            }

            // Обновляем даты проекта, если проверки пройдены
            projectExist.startDate = new Date(input.startDate);
            projectExist.finishDate = new Date(input.finishDate);
        }

        if (input.note !== undefined) {
            projectExist.note = input.note;
        }

        await projectExist.save();
        return projectExist;
    }

    async getProjectDetail(input: { id: number }): Promise<GetProjectDetailType> {
        const projectExist = await Project.findOne({where:{id:input.id},  include: [{ model: Currency, attributes: ["id", "name", 'symbol', "code"] }],})
        if(!projectExist) throw new NotFoundError('id',{id:['Не удалось найти проект']})

        const productContractCount = await Contract.count({where:{projectId:input.id, type:'product'}})
        const productServiceCount = await Contract.count({where:{projectId:input.id, type:'service'}})

        const activeCount = await Contract.count({where:{projectId:input.id, status:'active'}})
        const completedCount = await Contract.count({where:{projectId:input.id, type:'completed'}})
        const canceledCount = await Contract.count({where:{projectId:input.id, type:'canceled'}})



        let params:{
            totalProductCount:number,
            deliveredProductCount:number,
            totalAmount:number,
            totalSpent:number
        }= {
            totalAmount:0, deliveredProductCount:0,totalSpent:0, totalProductCount:0
        }


        try {
            const response = await sequelize.query(
                "EXEC GetProjectStats @ProjectId = :id",
                {
                    replacements: {
                        id: input.id,
                    },
                    type: QueryTypes.RAW
                }
            );

            if (!Array.isArray(response) || !Array.isArray(response[0])) {
                throw new ConflictError('Не удалось загрузить данные')
            }

            const stats = response[0][0]  as {
                totalProductCount: number;
                deliveredProductCount: number;
                totalAmount: number;
                totalSpent: number;
            };;

            // Проверка наличия и типа возвращаемых значений
            if (stats && typeof stats === 'object' && !Array.isArray(stats)) {
                // Проверка наличия ключей
                const hasRequiredKeys = [
                    'totalProductCount',
                    'deliveredProductCount',
                    'totalAmount',
                    'totalSpent'
                ].every(key => key in stats);

                if (hasRequiredKeys) {
                    // Проверка типов для каждого ключа
                    params.totalProductCount = typeof stats.totalProductCount === 'number' ? stats.totalProductCount : 0;
                    params.deliveredProductCount = typeof stats.deliveredProductCount === 'number' ? stats.deliveredProductCount : 0;
                    params.totalAmount = typeof stats.totalAmount === 'number' ? stats.totalAmount : 0;
                    params.totalSpent = typeof stats.totalSpent === 'number' ? stats.totalSpent : 0;
                } else {
                    console.warn("Хранимая процедура вернула объект без требуемых ключей");
                    // Сброс значений
                    params = {
                        totalProductCount: 0,
                        deliveredProductCount: 0,
                        totalAmount: 0,
                        totalSpent: 0
                    };
                }
            } else {
                console.warn("Хранимая процедура вернула некорректные данные");
                // Сброс значений
                params = {
                    totalProductCount: 0,
                    deliveredProductCount: 0,
                    totalAmount: 0,
                    totalSpent: 0
                };
            }

        } catch (error) {

            if (error instanceof Error) {
                console.error("Ошибка при выполнении процедуры GetProjectStats:", error.message);

                const sqlError = error as any;
                if (sqlError.message) {
                    // Печатаем содержимое original, чтобы понять, что это за объект
                    console.error("SQL Ошибка:", sqlError.message);

                    if (typeof sqlError.message === 'string') {
                        checkSQLErrorMessage(sqlError.message)
                    }

                } else {
                    throw new BaseError("Internal SQL error", 500,"Internal SQL error", error )
                }
            }

            throw new BaseError("Internal SQL error", 500,"Internal SQL error", error )

        }




        return {
            project:projectExist,
            productCount:productContractCount,
            serviceCount:productServiceCount,
            activeCount:activeCount,
            completedCount:completedCount,
            canceledCount:canceledCount,

            totalProductCount:params.totalProductCount,
            deliveredProductCount:params.deliveredProductCount,

            totalAmount:params.totalAmount,
            totalSpent:params.totalSpent
            // totalProductCount:0,
            // deliveredProductCount:0,
            //
            // totalAmount:0,
            // totalSpent:0
        }
    }

    async updateProjectStatus(input: UpdateProjectStatusType): Promise<Project> {
        const projectExist = await Project.findOne({where:{
            id:input.id
            }})

        if(!projectExist) throw new NotFoundError('Не удалось найти проект')

        if(projectExist.status){
            const contractExist = await Contract.findOne({where:{
                    status:'active',
                    projectId:input.id
                }})
            if(contractExist) throw new ConflictError('Есть незавершенные контракты')
        }

        projectExist.status = !projectExist.status
        await projectExist.save()
        return projectExist
    }

}
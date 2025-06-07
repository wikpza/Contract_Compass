import {DataTypes, Model} from "sequelize";
import sequelize from "./index";


export class Currency extends Model{
    public id!: number;
    public name!:string;
    public code!:string;
    public symbol!:string;
}
Currency.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        code: { type: DataTypes.STRING, allowNull: false },
        symbol: { type: DataTypes.STRING, allowNull: false },

    },
    {sequelize, modelName:"currency"}
)


export class Project extends Model{
    public id!: number;
    public name!:string;
    public note!:string;
    public startDate!:Date;
    public finishDate!:Date;
    public status!:boolean;
    public currencyId!:number
}
Project.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false, unique:true },
        startDate: {type:DataTypes.DATE, allowNull:false, defaultValue: new Date()},
        finishDate:{type:DataTypes.DATE, allowNull:true},
        status:{type:DataTypes.BOOLEAN, allowNull:false, defaultValue:true},
        note:{type:DataTypes.STRING(1000), allowNull:true},
        currencyId:{type:DataTypes.INTEGER, allowNull:false, references:{model:Currency, key:"id"}}
    },
    {sequelize, modelName:"project"}
)

export class Unit extends Model {
    public id!: number;
    public name!: string;
    public symbol!:string;

}
Unit.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(60), allowNull: false, unique:true },
        symbol:{type:DataTypes.STRING(10), allowNull:false, unique:true}
    },
    { sequelize, modelName: "unit" }
);

export class Product extends Model{
    public id!: number;
    public unitId!:number;
    public name!:string;
    public note?:string;
}

Product.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        unitId: { type: DataTypes.INTEGER, references: { model: Unit, key: "id" } },
        note: { type: DataTypes.STRING(1000), allowNull: true },
    },
    {sequelize, modelName:"product"}
)

export class Applicant extends Model{
    public id!: number;
    public name!:string;
    public email?:string;
    public phone?:string;
    public address?:string;
    public note?:string;
}
Applicant.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
        email: {type:DataTypes.STRING, allowNull:true},
        phone:{type:DataTypes.STRING, allowNull:true},
        address:{type:DataTypes.STRING, allowNull:true},
        note:{type:DataTypes.STRING(1000), allowNull:true},
},
    {sequelize, modelName:"applicant"}
    )
export class Purchaser extends Model{
    public id!: number;
    public name!:string;
    public email?:string;
    public phone?:string;
    public address?:string;
    public note?:string;
}

Purchaser.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        email: {type:DataTypes.STRING, allowNull:true},
        phone:{type:DataTypes.STRING, allowNull:true},
        address:{type:DataTypes.STRING, allowNull:true},
        note:{type:DataTypes.STRING(1000), allowNull:true},
    },
    {sequelize, modelName:"purchaser"}
)


export class Company extends Model{
    public id!: number;
    public name!:string;
    public email?:string;
    public phone?:string;
    public address?:string;
    public note?:string;
}
Company.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false, unique:true},
        email: {type:DataTypes.STRING, allowNull:true},
        phone:{type:DataTypes.STRING, allowNull:true},
        address:{type:DataTypes.STRING, allowNull:true},
        note:{type:DataTypes.STRING(1000), allowNull:true},
    },
    {sequelize, modelName:"company"}
)



export class AccessLink extends Model{
    public id!: number;
    public linkCode!:string;
    public projectId!:number;
    public status!:boolean;
}
AccessLink.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        linkCode: { type: DataTypes.STRING, allowNull: false },
        status:{type:DataTypes.BOOLEAN, allowNull:false, defaultValue:false},
        projectId:{type:DataTypes.INTEGER, references:{model:Project, key:"id"}, allowNull:false},
    },
    {sequelize, modelName:"access_link"}
)


export class Contract extends Model{
    public id!: number;
    public type!:"product" | "service";
    public name!:string;
    public projectId!:number;
    public applicantId!:number;
    public purchaserId!:number;
    public companyId!:number;
    public amount!:number;
    public giveAmount!:number;
    public currencyId!:number;
    public signDate!:Date;
    public officialBeginDate!:Date;
    public officialFinishDate!:Date;
    public status!:"active" | "completed" | 'canceled';
    public finishDate?:Date;
    public projectCurrencyExchangeRate?:number;
    public project?:Project
    public currency?:Currency
    public note?:string;

}

Contract.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.ENUM("product", "service"), allowNull: false },

        projectId:{type:DataTypes.INTEGER, references:{model:Project, key:"id"}, allowNull:false},
        applicantId:{type:DataTypes.INTEGER, references:{model:Applicant, key:"id"}, allowNull:false},
        purchaserId:{type:DataTypes.INTEGER, references:{model:Purchaser, key:"id"}, allowNull:false},
        companyId:{type:DataTypes.INTEGER, references:{model:Company, key:"id"}, allowNull:false},
        currencyId:{type:DataTypes.INTEGER, references:{model:Currency, key:"id"}, allowNull:false},


        amount: { type: DataTypes.DECIMAL(19, 6), allowNull: false },

        signDate: {type:DataTypes.DATE, allowNull:false},
        officialBeginDate: {type:DataTypes.DATE, allowNull:false},
        officialFinishDate: {type:DataTypes.DATE, allowNull:false},

        status:{ type: DataTypes.ENUM("active", "completed", 'canceled'), allowNull: false, defaultValue:"active" },

        projectCurrencyExchangeRate: { type: DataTypes.DECIMAL(11, 6), allowNull: true },

        giveAmount: { type: DataTypes.DECIMAL(19, 6), allowNull: false, defaultValue:0 },

        note: { type: DataTypes.STRING(1000), allowNull: true },
        finishDate: {type:DataTypes.DATE, allowNull:true},

    },
    {sequelize, modelName:"contract"}
)

export class FileVolume extends Model{
    public id!: number;
    public name!:string;
    public key!:string;
    public contractId!:number
}

FileVolume.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        key: { type: DataTypes.STRING, allowNull: false },
        contractId:{type:DataTypes.INTEGER, references:{model:Contract, key:"id"}, allowNull:false},

    },
    {sequelize, modelName:"file_volume"}
)

export class FileLink extends Model{
    public id!: number;
    public name!:string;
    public url!:string;
    public contractId!:number
}

FileLink.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        url: { type: DataTypes.STRING, allowNull: false },
        contractId:{type:DataTypes.INTEGER, references:{model:Contract, key:"id"}, allowNull:false},

    },
    {sequelize, modelName:"file_link"}
)



export class ProductInventory extends Model{
    public id!: number;
    public productId!:number;
    public contractId!:number;
    public note!:string;
    public contractQuantity!:number;
    public takeQuantity!:number;
    // public giveQuantity!:number;
    public contract?:Contract
    public total?:number

}

ProductInventory.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        productId:{type:DataTypes.INTEGER, references:{model:Product, key:"id"}, allowNull:false},
        contractId:{type:DataTypes.INTEGER, references:{model:Contract, key:"id"}, allowNull:false},
        note: { type: DataTypes.STRING(1000), allowNull: true },
        contractQuantity: { type: DataTypes.DECIMAL(19, 6), allowNull: false },
        takeQuantity: { type: DataTypes.DECIMAL(19, 6), allowNull: false, defaultValue:0 },
        // giveQuantity: { type: DataTypes.DECIMAL(19, 6), allowNull: false },
    },
    {sequelize, modelName:"product_inventory"}
)


export class ProductInventoryHistory extends Model{
    public id!: number;
    public productInventoryId!:number;
    public quantity!:number;
    public type!:'issued' | 'refund';
    public giveDate!:Date;
    public note!:string;
}

ProductInventoryHistory.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        type: { type: DataTypes.ENUM("issued", "refund"), allowNull: false },
        productInventoryId:{type:DataTypes.INTEGER, references:{model:ProductInventory, key:"id"}, allowNull:true},
        giveDate:{type:DataTypes.DATE, allowNull:false},
        note: { type: DataTypes.STRING(1000), allowNull: true },
        quantity: { type: DataTypes.DECIMAL(19, 6), allowNull: false },
    },
    {sequelize, modelName:"product_inventory_history"}
)

export class ContractPaymentHistory extends Model{
    public id!: number;
    public contractId!:number;
    public currencyId!:number;
    public type!:'issued' | 'refund' | 'canceled';
    public giveDate!:Date;
    public note!:string;
    public amount!:number;
    public contractCurrencyExchangeRate!:number;
    public contract!:Contract

}

ContractPaymentHistory.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        type: { type: DataTypes.ENUM("issued", "refund" , 'canceled'), allowNull: false },
        contractId:{type:DataTypes.INTEGER, references:{model:Contract, key:"id"}, allowNull:false},
        currencyId:{type:DataTypes.INTEGER, references:{model:Currency, key:"id"}, allowNull:false},
        giveDate:{type:DataTypes.DATE, allowNull:false},
        note: { type: DataTypes.STRING(1000), allowNull: true },
        amount: { type: DataTypes.DECIMAL(19, 6), allowNull: false },
        contractCurrencyExchangeRate: { type: DataTypes.DECIMAL(11, 6), allowNull: true },
    },
    {sequelize, modelName:"contract_payment_history"}
)

export class User extends Model{
    public id!: number;
    public login!:string;
    public password!:string;
    public firstName!:string;
    public middleName!:string;
    public lastName!:string;


}

User.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        login:{type:DataTypes.STRING, allowNull:false},
        password:{type:DataTypes.STRING, allowNull:false},
        firstName:{type:DataTypes.STRING, allowNull:false},
        middleName:{type:DataTypes.STRING, allowNull:false},
        lastName:{type:DataTypes.STRING, allowNull:false},
    },
    {sequelize, modelName:"user"}
)



export async function syncDatabase(force: boolean = false, alter: boolean = false) {
    try {
        console.log('Starting database synchronization...');

        // Синхронизация моделей в правильном порядке (сначала независимые, затем зависимые)
        await Currency.sync({ force, alter});
        console.log('Currency table synchronized');

        await Unit.sync({ force, alter});
        console.log('Unit table synchronized');

        await Project.sync({ force, alter});
        console.log('Project table synchronized');

        await Applicant.sync({ force, alter});
        console.log('Applicant table synchronized');

        await Purchaser.sync({ force, alter});
        console.log('Purchaser table synchronized');

        await Company.sync({ force, alter});
        console.log('Company table synchronized');

        await AccessLink.sync({ force, alter});
        console.log('AccessLink table synchronized');


        await Contract.sync({ force, alter});
        console.log('Contract table synchronized');

        await Product.sync({ force, alter});
        console.log('Product table synchronized');


        await FileVolume.sync({ force, alter});
        console.log('FileVolume table synchronized');

        await FileLink.sync({ force, alter});
        console.log('FileLink table synchronized');

        await ProductInventory.sync({ force, alter});
        console.log('ProductInventory table synchronized');

        await ProductInventoryHistory.sync({ force, alter});
        console.log('ProductInventoryHistory table synchronized');

        await ContractPaymentHistory.sync({ force, alter});
        console.log('ContractPaymentHistory table synchronized');

        await User.sync({ force, alter});
        console.log('User table synchronized');


        Currency.hasMany(ContractPaymentHistory, { foreignKey: "currencyId" });
        ContractPaymentHistory.belongsTo(Currency, { foreignKey: "currencyId"});

        Contract.hasMany(ContractPaymentHistory, { foreignKey: "contractId" });
        ContractPaymentHistory.belongsTo(Contract, { foreignKey: "contractId"});

        ProductInventory.hasMany(ProductInventoryHistory, { foreignKey: "productInventoryId" });
        ProductInventoryHistory.belongsTo(ProductInventory, { foreignKey: "productInventoryId"});

        Product.hasMany(ProductInventory, { foreignKey: "productId" });
        ProductInventory.belongsTo(Product, { foreignKey: "productId"});

        Contract.hasMany(ProductInventory, { foreignKey: "contractId" });
        ProductInventory.belongsTo(Contract, { foreignKey: "contractId"});
//
        Contract.hasMany(FileVolume, {foreignKey:"contractId"})
        FileVolume.belongsTo(Contract, {foreignKey:"contractId"})

        Contract.hasMany(FileLink, {foreignKey:"contractId"})
        FileLink.belongsTo(Contract, {foreignKey:"contractId"})

        Currency.hasMany(Contract, { foreignKey: "currencyId"});
        Contract.belongsTo(Currency, { foreignKey: "currencyId"});
//
        Project.hasMany(Contract, { foreignKey: "projectId"});
        Contract.belongsTo(Project, { foreignKey: "projectId"});
//
        Applicant.hasMany(Contract, {foreignKey:"applicantId"})
        Contract.belongsTo(Applicant, {foreignKey:"applicantId"})

        Purchaser.hasMany(Contract, {foreignKey:"purchaserId"})
        Contract.belongsTo(Purchaser, {foreignKey:"purchaserId"})

        Company.hasMany(Contract, {foreignKey:"companyId"})
        Contract.belongsTo(Company, {foreignKey:"companyId"})

        Project.hasMany(AccessLink, {foreignKey:"projectId"})
        AccessLink.belongsTo(Project, {foreignKey:"projectId"})

        Currency.hasMany(Project, {foreignKey:"currencyId"})
        Project.belongsTo(Currency, {foreignKey:"currencyId"})

        Unit.hasMany(Product, {foreignKey:"unitId"})
        Product.belongsTo(Unit,{foreignKey:'unitId'})


        console.log('Database synchronization completed successfully');
    } catch (error) {
        console.error('Error during database synchronization:', error);
        throw error;
    }
}


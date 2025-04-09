import {DataTypes, Model} from "sequelize";
import sequelize from "./index";

export class Unit extends Model {
    public id!: number;
    public name!: string;
}
Unit.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        note: {type:DataTypes.STRING, allowNull:false},
        symbol:{type:DataTypes.STRING, allowNull:false}
    },
    { sequelize, modelName: "unit" }
);

export class Product extends Model{
    public id!: number;
    public unitId!:number;
    public name!:string;
    public note!:string;
}

Product.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        unitId: { type: DataTypes.INTEGER, references: { model: Unit, key: "id" } },
    },
    {sequelize, modelName:"product"}
)

export class Applicant extends Model{
    public id!: number;
    public name!:string;
    public email!:string;
    public phone!:string;
    public address!:string;
    public note!:string;
}
Applicant.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
        email: {type:DataTypes.STRING, allowNull:false},
        phone:{type:DataTypes.STRING, allowNull:false},
        address:{type:DataTypes.STRING, allowNull:false},
        note:{type:DataTypes.STRING, allowNull:false},
},
    {sequelize, modelName:"applicant"}
    )
export class Purchaser extends Model{
    public id!: number;
    public name!:string;
    public email!:string;
    public phone!:string;
    public address!:string;
    public note!:string;
}

Purchaser.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        email: {type:DataTypes.STRING, allowNull:false},
        phone:{type:DataTypes.STRING, allowNull:false},
        address:{type:DataTypes.STRING, allowNull:false},
        note:{type:DataTypes.STRING, allowNull:false},
    },
    {sequelize, modelName:"purchaser"}
)


export class Company extends Model{
    public id!: number;
    public name!:string;
    public email!:string;
    public phone!:string;
    public address!:string;
    public note!:string;
}

Company.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        email: {type:DataTypes.STRING, allowNull:false},
        phone:{type:DataTypes.STRING, allowNull:false},
        address:{type:DataTypes.STRING, allowNull:false},
        note:{type:DataTypes.STRING, allowNull:false},
    },
    {sequelize, modelName:"company"}
)

export class Currency extends Model{
    public id!: number;
    public name!:string;
    public code!:number;
    public symbol!:boolean;
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
        name: { type: DataTypes.STRING, allowNull: false },
        startDate: {type:DataTypes.DATE, allowNull:false, defaultValue: new Date()},
        finishDate:{type:DataTypes.STRING, allowNull:true},
        status:{type:DataTypes.BOOLEAN, allowNull:false, defaultValue:false},
        note:{type:DataTypes.STRING, allowNull:false},
        currencyId:{type:DataTypes.INTEGER, allowNull:false, references:{model:Currency, key:"id"}}
    },
    {sequelize, modelName:"project"}
)


export class AccessLink extends Model{
    public id!: number;
    public linkCode!:string;
    public projectId!:number;
    public status!:boolean;
}

AccessLink.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        status:{type:DataTypes.BOOLEAN, allowNull:false, defaultValue:false},
        projectId:{type:DataTypes.INTEGER, references:{model:Project, key:"id"}, allowNull:false},
    },
    {sequelize, modelName:"access_link"}
)


export class Contract extends Model{
    public id!: number;
    public type!:"product" | "service";
    public name!:string;
    public note!:boolean;
    public projectId!:number;
    public applicantId!:number;
    public purchaserId!:number;
    public companyId!:number;
    public amount!:number;
    public giveAmount!:number;
    public currencyId!:number;
    public transferCurrencyId!:number;
    public transferCurrencyExchangeRate!:number;
    public projectCurrencyExchangeRate!:number;
    public signDate!:Date;
    public officialBeginDate!:Date;
    public officialFinishDate!:Date;
    public finishDate!:Date;
    public status!:boolean;

    public readonly baseCurrencyContracts?: Currency;
    public readonly transferCurrencyContracts?: Currency;
}

Contract.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        note: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.ENUM("product", "service"), allowNull: false },
        projectId:{type:DataTypes.INTEGER, references:{model:Project, key:"id"}, allowNull:false},
        applicantId:{type:DataTypes.INTEGER, references:{model:Applicant, key:"id"}, allowNull:false},
        purchaserId:{type:DataTypes.INTEGER, references:{model:Purchaser, key:"id"}, allowNull:false},
        companyId:{type:DataTypes.INTEGER, references:{model:Company, key:"id"}, allowNull:false},
        amount: { type: DataTypes.DECIMAL(19, 6), allowNull: false },
        giveAmount: { type: DataTypes.DECIMAL(19, 6), allowNull: false },
        currencyId:{type:DataTypes.INTEGER, references:{model:Currency, key:"id"}, allowNull:false},
        transferCurrencyId:{type:DataTypes.INTEGER, references:{model:Currency, key:"id"}, allowNull:false},
        transferCurrencyExchangeRate: { type: DataTypes.DECIMAL(11, 6), allowNull: false },
        projectCurrencyExchangeRate: { type: DataTypes.DECIMAL(11, 6), allowNull: false },
        signDate: {type:DataTypes.DATE, allowNull:false},
        officialBeginDate: {type:DataTypes.DATE, allowNull:false},
        officialFinishDate: {type:DataTypes.DATE, allowNull:false},
        finishDate: {type:DataTypes.DATE, allowNull:false},
        status:{type:DataTypes.BOOLEAN, allowNull:false, defaultValue:false},
    },
    {sequelize, modelName:"contract"}
)

export class ProductInventory extends Model{
    public id!: number;
    public productId!:number;
    public contractId!:number;
    public note!:string;
    public contractQuantity!:number;
    public takeQuantity!:number;
    public giveQuantity!:number;

}

ProductInventory.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        productId:{type:DataTypes.INTEGER, references:{model:Product, key:"id"}, allowNull:false},
        contractId:{type:DataTypes.INTEGER, references:{model:Contract, key:"id"}, allowNull:false},
        note: { type: DataTypes.STRING, allowNull: false },
        contractQuantity: { type: DataTypes.DECIMAL(19, 6), allowNull: false },
        takeQuantity: { type: DataTypes.DECIMAL(19, 6), allowNull: false },
        giveQuantity: { type: DataTypes.DECIMAL(19, 6), allowNull: false },
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
        productInventoryId:{type:DataTypes.INTEGER, references:{model:ProductInventory, key:"id"}, allowNull:false},
        giveDate:{type:DataTypes.DATE, allowNull:false},
        note: { type: DataTypes.STRING, allowNull: false },
    },
    {sequelize, modelName:"product_inventory_history"}
)

export class ContractPaymentHistory extends Model{
    public id!: number;
    public contractId!:number;
    public currencyId!:number;
    public type!:'issued' | 'refund';
    public giveDate!:Date;
    public note!:string;
    public amount!:number;
    public projectCurrencyExchangeRate!:number;

}

ContractPaymentHistory.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        type: { type: DataTypes.ENUM("issued", "refund"), allowNull: false },
        contractId:{type:DataTypes.INTEGER, references:{model:Contract, key:"id"}, allowNull:false},
        currencyId:{type:DataTypes.INTEGER, references:{model:Currency, key:"id"}, allowNull:false},
        giveDate:{type:DataTypes.DATE, allowNull:false},
        note: { type: DataTypes.STRING, allowNull: false },
        amount: { type: DataTypes.DECIMAL(19, 6), allowNull: false },
        projectCurrencyExchangeRate: { type: DataTypes.DECIMAL(11, 6), allowNull: false },
    },
    {sequelize, modelName:"product_inventory_history"}
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
    {sequelize, modelName:"product_inventory_history"}
)


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

Currency.hasMany(Contract, { foreignKey: "currencyId", as: 'baseCurrencyContracts' });
Contract.belongsTo(Currency, { foreignKey: "currencyId", as: 'currency' });

Currency.hasMany(Contract, { foreignKey: "transferCurrencyId", as: 'transferCurrencyContracts' });
Contract.belongsTo(Currency, { foreignKey: "transferCurrencyId", as: 'transferCurrency' });

Applicant.hasMany(Contract, {foreignKey:"applicantId"})
Contract.belongsTo(Applicant, {foreignKey:"applicantId"})

Purchaser.hasMany(Contract, {foreignKey:"purchaserId"})
Contract.belongsTo(Purchaser, {foreignKey:"purchaserId"})

Company.hasMany(Contract, {foreignKey:"companyId"})
Contract.belongsTo(Company, {foreignKey:"companyId"})

Project.hasMany(AccessLink, {foreignKey:"projectId"})
AccessLink.belongsTo(Project, {foreignKey:"projectId"})

Unit.hasMany(Product, {foreignKey:"unitId"})
Product.belongsTo(Unit,{foreignKey:'unitId'})
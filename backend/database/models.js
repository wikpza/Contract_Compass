"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.ContractPaymentHistory = exports.ProductInventoryHistory = exports.ProductInventory = exports.FileLink = exports.FileVolume = exports.Contract = exports.AccessLink = exports.Company = exports.Purchaser = exports.Applicant = exports.Product = exports.Unit = exports.Project = exports.Currency = void 0;
exports.syncDatabase = syncDatabase;
const sequelize_1 = require("sequelize");
const index_1 = __importDefault(require("./index"));
class Currency extends sequelize_1.Model {
}
exports.Currency = Currency;
Currency.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    code: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    symbol: { type: sequelize_1.DataTypes.STRING, allowNull: false },
}, { sequelize: index_1.default, modelName: "currency" });
class Project extends sequelize_1.Model {
}
exports.Project = Project;
Project.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
    startDate: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: new Date() },
    finishDate: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    status: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    note: { type: sequelize_1.DataTypes.STRING(1000), allowNull: true },
    currencyId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false, references: { model: Currency, key: "id" } }
}, { sequelize: index_1.default, modelName: "project" });
class Unit extends sequelize_1.Model {
}
exports.Unit = Unit;
Unit.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING(60), allowNull: false, unique: true },
    symbol: { type: sequelize_1.DataTypes.STRING(10), allowNull: false, unique: true }
}, { sequelize: index_1.default, modelName: "unit" });
class Product extends sequelize_1.Model {
}
exports.Product = Product;
Product.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    unitId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Unit, key: "id" } },
    note: { type: sequelize_1.DataTypes.STRING(1000), allowNull: true },
}, { sequelize: index_1.default, modelName: "product" });
class Applicant extends sequelize_1.Model {
}
exports.Applicant = Applicant;
Applicant.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    phone: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    address: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    note: { type: sequelize_1.DataTypes.STRING(1000), allowNull: true },
}, { sequelize: index_1.default, modelName: "applicant" });
class Purchaser extends sequelize_1.Model {
}
exports.Purchaser = Purchaser;
Purchaser.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    phone: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    address: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    note: { type: sequelize_1.DataTypes.STRING(1000), allowNull: true },
}, { sequelize: index_1.default, modelName: "purchaser" });
class Company extends sequelize_1.Model {
}
exports.Company = Company;
Company.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false, unique: true },
    email: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    phone: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    address: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    note: { type: sequelize_1.DataTypes.STRING(1000), allowNull: true },
}, { sequelize: index_1.default, modelName: "company" });
class AccessLink extends sequelize_1.Model {
}
exports.AccessLink = AccessLink;
AccessLink.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    linkCode: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    status: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    projectId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Project, key: "id" }, allowNull: false },
}, { sequelize: index_1.default, modelName: "access_link" });
class Contract extends sequelize_1.Model {
}
exports.Contract = Contract;
Contract.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    type: { type: sequelize_1.DataTypes.ENUM("product", "service"), allowNull: false },
    projectId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Project, key: "id" }, allowNull: false },
    applicantId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Applicant, key: "id" }, allowNull: false },
    purchaserId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Purchaser, key: "id" }, allowNull: false },
    companyId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Company, key: "id" }, allowNull: false },
    currencyId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Currency, key: "id" }, allowNull: false },
    amount: { type: sequelize_1.DataTypes.DECIMAL(19, 6), allowNull: false },
    signDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    officialBeginDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    officialFinishDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    status: { type: sequelize_1.DataTypes.ENUM("active", "completed", 'canceled'), allowNull: false, defaultValue: "active" },
    projectCurrencyExchangeRate: { type: sequelize_1.DataTypes.DECIMAL(11, 6), allowNull: true },
    giveAmount: { type: sequelize_1.DataTypes.DECIMAL(19, 6), allowNull: false, defaultValue: 0 },
    note: { type: sequelize_1.DataTypes.STRING(1000), allowNull: true },
    finishDate: { type: sequelize_1.DataTypes.DATE, allowNull: true },
}, { sequelize: index_1.default, modelName: "contract" });
class FileVolume extends sequelize_1.Model {
}
exports.FileVolume = FileVolume;
FileVolume.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    key: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    contractId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Contract, key: "id" }, allowNull: false },
}, { sequelize: index_1.default, modelName: "file_volume" });
class FileLink extends sequelize_1.Model {
}
exports.FileLink = FileLink;
FileLink.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    url: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    contractId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Contract, key: "id" }, allowNull: false },
}, { sequelize: index_1.default, modelName: "file_link" });
class ProductInventory extends sequelize_1.Model {
}
exports.ProductInventory = ProductInventory;
ProductInventory.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Product, key: "id" }, allowNull: false },
    contractId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Contract, key: "id" }, allowNull: false },
    note: { type: sequelize_1.DataTypes.STRING(1000), allowNull: true },
    contractQuantity: { type: sequelize_1.DataTypes.DECIMAL(19, 6), allowNull: false },
    takeQuantity: { type: sequelize_1.DataTypes.DECIMAL(19, 6), allowNull: false, defaultValue: 0 },
    // giveQuantity: { type: DataTypes.DECIMAL(19, 6), allowNull: false },
}, { sequelize: index_1.default, modelName: "product_inventory" });
class ProductInventoryHistory extends sequelize_1.Model {
}
exports.ProductInventoryHistory = ProductInventoryHistory;
ProductInventoryHistory.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: sequelize_1.DataTypes.ENUM("issued", "refund"), allowNull: false },
    productInventoryId: { type: sequelize_1.DataTypes.INTEGER, references: { model: ProductInventory, key: "id" }, allowNull: true },
    giveDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    note: { type: sequelize_1.DataTypes.STRING(1000), allowNull: true },
    quantity: { type: sequelize_1.DataTypes.DECIMAL(19, 6), allowNull: false },
}, { sequelize: index_1.default, modelName: "product_inventory_history" });
class ContractPaymentHistory extends sequelize_1.Model {
}
exports.ContractPaymentHistory = ContractPaymentHistory;
ContractPaymentHistory.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: sequelize_1.DataTypes.ENUM("issued", "refund", 'canceled'), allowNull: false },
    contractId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Contract, key: "id" }, allowNull: false },
    currencyId: { type: sequelize_1.DataTypes.INTEGER, references: { model: Currency, key: "id" }, allowNull: false },
    giveDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    note: { type: sequelize_1.DataTypes.STRING(1000), allowNull: true },
    amount: { type: sequelize_1.DataTypes.DECIMAL(19, 6), allowNull: false },
    contractCurrencyExchangeRate: { type: sequelize_1.DataTypes.DECIMAL(11, 6), allowNull: true },
}, { sequelize: index_1.default, modelName: "contract_payment_history" });
class User extends sequelize_1.Model {
}
exports.User = User;
User.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    login: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    password: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    firstName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    middleName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    lastName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
}, { sequelize: index_1.default, modelName: "user" });
function syncDatabase() {
    return __awaiter(this, arguments, void 0, function* (force = false, alter = false) {
        try {
            console.log('Starting database synchronization...');
            // Синхронизация моделей в правильном порядке (сначала независимые, затем зависимые)
            yield Currency.sync({ force, alter });
            console.log('Currency table synchronized');
            yield Unit.sync({ force, alter });
            console.log('Unit table synchronized');
            yield Project.sync({ force, alter });
            console.log('Project table synchronized');
            yield Applicant.sync({ force, alter });
            console.log('Applicant table synchronized');
            yield Purchaser.sync({ force, alter });
            console.log('Purchaser table synchronized');
            yield Company.sync({ force, alter });
            console.log('Company table synchronized');
            yield AccessLink.sync({ force, alter });
            console.log('AccessLink table synchronized');
            yield Contract.sync({ force, alter });
            console.log('Contract table synchronized');
            yield Product.sync({ force, alter });
            console.log('Product table synchronized');
            yield FileVolume.sync({ force, alter });
            console.log('FileVolume table synchronized');
            yield FileLink.sync({ force, alter });
            console.log('FileLink table synchronized');
            yield ProductInventory.sync({ force, alter });
            console.log('ProductInventory table synchronized');
            yield ProductInventoryHistory.sync({ force, alter });
            console.log('ProductInventoryHistory table synchronized');
            yield ContractPaymentHistory.sync({ force, alter });
            console.log('ContractPaymentHistory table synchronized');
            yield User.sync({ force, alter });
            console.log('User table synchronized');
            Currency.hasMany(ContractPaymentHistory, { foreignKey: "currencyId" });
            ContractPaymentHistory.belongsTo(Currency, { foreignKey: "currencyId" });
            Contract.hasMany(ContractPaymentHistory, { foreignKey: "contractId" });
            ContractPaymentHistory.belongsTo(Contract, { foreignKey: "contractId" });
            ProductInventory.hasMany(ProductInventoryHistory, { foreignKey: "productInventoryId" });
            ProductInventoryHistory.belongsTo(ProductInventory, { foreignKey: "productInventoryId" });
            Product.hasMany(ProductInventory, { foreignKey: "productId" });
            ProductInventory.belongsTo(Product, { foreignKey: "productId" });
            Contract.hasMany(ProductInventory, { foreignKey: "contractId" });
            ProductInventory.belongsTo(Contract, { foreignKey: "contractId" });
            //
            Contract.hasMany(FileVolume, { foreignKey: "contractId" });
            FileVolume.belongsTo(Contract, { foreignKey: "contractId" });
            Contract.hasMany(FileLink, { foreignKey: "contractId" });
            FileLink.belongsTo(Contract, { foreignKey: "contractId" });
            Currency.hasMany(Contract, { foreignKey: "currencyId" });
            Contract.belongsTo(Currency, { foreignKey: "currencyId" });
            //
            Project.hasMany(Contract, { foreignKey: "projectId" });
            Contract.belongsTo(Project, { foreignKey: "projectId" });
            //
            Applicant.hasMany(Contract, { foreignKey: "applicantId" });
            Contract.belongsTo(Applicant, { foreignKey: "applicantId" });
            Purchaser.hasMany(Contract, { foreignKey: "purchaserId" });
            Contract.belongsTo(Purchaser, { foreignKey: "purchaserId" });
            Company.hasMany(Contract, { foreignKey: "companyId" });
            Contract.belongsTo(Company, { foreignKey: "companyId" });
            Project.hasMany(AccessLink, { foreignKey: "projectId" });
            AccessLink.belongsTo(Project, { foreignKey: "projectId" });
            Currency.hasMany(Project, { foreignKey: "currencyId" });
            Project.belongsTo(Currency, { foreignKey: "currencyId" });
            Unit.hasMany(Product, { foreignKey: "unitId" });
            Product.belongsTo(Unit, { foreignKey: 'unitId' });
            console.log('Database synchronization completed successfully');
        }
        catch (error) {
            console.error('Error during database synchronization:', error);
            throw error;
        }
    });
}

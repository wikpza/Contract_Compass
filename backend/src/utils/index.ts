// import jwt from "jsonwebtoken";
// import dotenv from 'dotenv'
// import {TokenEmployee} from "../models/employee.model";
// import {ResultPayLoanType} from "../models/loan.model";
// dotenv.config()
// export const generateJwt =(input:TokenEmployee)=>{
//
//     const secretKey = process.env.SECRET_KEY
//
//     if(!secretKey){
//         throw new Error("SECRET_KEY is not defined")
//     }
//
//     return jwt.sign(
//         {id:input.id,
//             firstName:input.firstName,
//             lastName:input.lastName,
//             middleName:input.middleName,
//             login:input.login,
//             phone:input.phone
//         },
//         secretKey,
//         {expiresIn:"10d"},
//     )}
//
//
//
// const EmployeePermission = [
//     [
//         {
//             "id": 1,
//             "permission": "Unit List",
//             "permissionKey": "unit_list",
//             "description": "Allows viewing the list of measurement units."
//         },
//         {
//             "id": 2,
//             "permission": "Unit Work (Create, Update, Delete)",
//             "permissionKey": "unit_work",
//             "description": "Allows creating, updating, and deleting measurement units."
//         },
//         {
//             "id": 3,
//             "permission": "Employee List",
//             "permissionKey": "employee_list",
//             "description": "Allows viewing the list of employees."
//         },
//         {
//             "id": 4,
//             "permission": "Employee Work (Create, Update, Delete)",
//             "permissionKey": "employee_work",
//             "description": "Allows creating, updating, and deleting employee records."
//         },
//         {
//             "id": 5,
//             "permission": "Position List",
//             "permissionKey": "position_list",
//             "description": "Allows viewing the list of employee positions."
//         },
//         {
//             "id": 6,
//             "permission": "Position Work (Create, Update, Delete)",
//             "permissionKey": "position_work",
//             "description": "Allows creating, updating, and deleting positions."
//         },
//         {
//             "id": 7,
//             "permission": "Permission List",
//             "permissionKey": "permission_list",
//             "description": "Allows viewing the list of available permissions."
//         },
//         {
//             "id": 8,
//             "permission": "Permission Work (Update)",
//             "permissionKey": "permission_work",
//             "description": "Allows updating permission settings."
//         },
//         {
//             "id": 9,
//             "permission": "Raw Material List",
//             "permissionKey": "raw_material_list",
//             "description": "Allows viewing the list of raw materials."
//         },
//         {
//             "id": 10,
//             "permission": "Raw Material Work (Create, Update, Delete)",
//             "permissionKey": "raw_material_work",
//             "description": "Allows creating, updating, and deleting raw materials."
//         },
//         {
//             "id": 11,
//             "permission": "Product List",
//             "permissionKey": "product_list",
//             "description": "Allows viewing the list of products."
//         },
//         {
//             "id": 12,
//             "permission": "Product Work (Create, Update, Delete)",
//             "permissionKey": "product_work",
//             "description": "Allows creating, updating, and deleting products."
//         },
//         {
//             "id": 13,
//             "permission": "Product Manufacturing Instruction Set Up",
//             "permissionKey": "product_manufacturing_instruction_list",
//             "description": "Allows setting up manufacturing instructions for products."
//         },
//         {
//             "id": 13,
//             "permission": "Product Manufacturing Instruction Set Up",
//             "permissionKey": "product_manufacturing_instruction_work",
//             "description": "Allows setting up manufacturing instructions for products."
//         },
//         {
//             "id": 14,
//             "permission": "Product Manufacturing",
//             "permissionKey": "product_manufacturing_list",
//             "description": "Allows manufacturing products based on predefined instructions."
//         },
//         {
//             "id": 14,
//             "permission": "Product Manufacturing",
//             "permissionKey": "product_manufacturing_work",
//             "description": "Allows manufacturing products based on predefined instructions."
//         },
//         {
//             "id": 15,
//             "permission": "Raw Material Procurement",
//             "permissionKey": "raw_material_procurement_list",
//             "description": "Allows procuring raw materials."
//         },
//         {
//             "id": 15,
//             "permission": "Raw Material Procurement_work",
//             "permissionKey": "raw_material_procurement_work",
//             "description": "Allows procuring raw materials."
//         },
//         {
//             "id": 16,
//             "permission": "Product Sale",
//             "permissionKey": "product_sale_list",
//             "description": "Allows selling manufactured products."
//         },
//         {
//             "id": 16,
//             "permission": "Product Sale",
//             "permissionKey": "product_sale_work",
//             "description": "Allows selling manufactured products."
//         },
//         {
//             "id": 17,
//             "permission": "Budget Balance",
//             "permissionKey": "budget_info",
//             "description": "Allows viewing the current balance of the company budget."
//         },
//         {
//             "id": 18,
//             "permission": "Budget Transactions History",
//             "permissionKey": "budget_work",
//             "description": "Allows viewing past financial transactions."
//         },
//
//         {
//             "id": 22,
//             "permission": "Salary List Report",
//             "permissionKey": "salary_list_report",
//             "description": "Allows viewing salary reports."
//         },
//         {
//             "id": 23,
//             "permission": "Salary Change",
//             "permissionKey": "salary_change",
//             "description": "Allows modifying employee salaries."
//         },
//         {
//             "id": 24,
//             "permission": "Salary Give",
//             "permissionKey": "salary_give",
//             "description": "Allows processing salary payments."
//         },
//         {
//             "id": 25,
//             "permission": "Loan List",
//             "permissionKey": "loan_list",
//             "description": "Allows viewing a list of company loans."
//         },
//         {
//             "id": 26,
//             "permission": "Loan Take",
//             "permissionKey": "loan_take",
//             "description": "Allows taking a new loan."
//         },
//         {
//             "id": 27,
//             "permission": "Loan Pay",
//             "permissionKey": "loan_pay",
//             "description": "Allows paying back a loan."
//         },
//         {
//             "id": 28,
//             "permission": "Admin",
//             "permissionKey": "admin",
//             "description": "Allows everything."
//         }
//     ]
//
//
//
// ]
//
// export function transformSalaryData(input:any) {
//     // Проверка, что объект имеет нужную структуру
//     if (input &&
//         typeof input.employeeSalariesId === 'number' &&
//         typeof input.employeeId === 'number' &&
//         typeof input.numSoledProduct === 'number' &&
//         typeof input.numCreatedProduct === 'number' &&
//         typeof input.numBuyMaterial === 'number' &&
//         typeof input.totalAction === 'number' &&
//         typeof input.bonus === 'number' &&
//         typeof input.salary === 'number' &&
//         typeof input.totalSalary === 'number' &&
//         typeof input.isGiven === 'boolean' &&
//         input.salaryDate instanceof Date &&
//         input.createdAt instanceof Date &&
//         input.updatedAt instanceof Date &&
//         typeof input.firstName === 'string' &&
//         typeof input.lastName === 'string' &&
//         typeof input.middleName === 'string' &&
//         typeof input.positionId === 'number' &&
//         typeof input.address === 'string' &&
//         typeof input.phone === 'string') {
//
//         // Преобразование объекта в новый формат
//         const transformed = {
//             id: input.employeeSalariesId,
//             numSoledProduct: input.numSoledProduct,
//             numCreatedProduct: input.numCreatedProduct,
//             numBuyMaterial: input.numBuyMaterial,
//             employeeId: input.employeeId,
//             employee: {
//                 id: input.employeeId, // Связываем по employeeId
//                 firstName: input.firstName,
//                 lastName: input.lastName,
//                 middleName: input.middleName,
//             },
//             bonus: input.bonus,
//             salary: input.salary,
//             totalSalary: input.totalSalary,
//             totalAction: input.totalAction,
//             isGiven: input.isGiven,
//             salaryDate: new Date(input.salaryDate), // Преобразование в Date
//             createdAt: new Date(input.createdAt),  // Преобразование в Date
//             updatedAt: new Date(input.updatedAt),  // Преобразование в Date
//         };
//
//         return transformed;
//     } else {
//         throw new Error('Invalid input format');
//     }
// }
//
// export function  isResultPayLoanType(output: any): output is ResultPayLoanType {
//     return (
//         output &&
//         typeof output.lastPaymentDate === 'object' && // Date type check
//         output.lastPaymentDate instanceof Date &&
//         typeof output.loanPart === 'number' &&
//         typeof output.loanProcent === 'number' &&
//         typeof output.penya === 'number' &&
//         typeof output.overdueDays === 'number'
//     );
// }
//

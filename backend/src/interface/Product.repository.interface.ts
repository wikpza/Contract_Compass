import {Company, Product} from "../database/models";
import {CreateProductType, DeleteProductType, GetProductType, UpdateProductType} from "../models/Product.model";

export interface ProductRepositoryInterface {
    getProduct(input:GetProductType):Promise<{ rows: Product[]; count: number; }>
    createProduct(input:CreateProductType):Promise<Product>
    deleteProduct(input:DeleteProductType):Promise<Product>
    updateProduct(input:UpdateProductType):Promise<Product>
}
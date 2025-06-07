import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {object, z} from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import {FormErrors, isFormErrors} from "@/lib/errors";
import {toast} from "sonner";
import {Textarea} from "@/components/ui/textarea.tsx";
import {CreateProductType, GetProductType, UpdateProductType} from "@/types/Product.ts";
import {useGetUnits} from "@/api/Unit.api.ts";
import {SearchParams} from "@/types";
import {AddProductInventoryType, GetProductInventoryType, UpdateProductContractType} from "@/types/Inventory.ts";
import {useGetProducts} from "@/api/Product.api.ts";

const formSchema = z.object({
    productId: z.number().min(1, "Please select a unit"),
    note: z.string().optional().or(z.literal('')),
    contractQuantity: z.coerce.number().positive("Количество должно быть больше нуля"),
});
type FormValues = z.infer<typeof formSchema>;

interface FormProps {
    data?: GetProductInventoryType;
    onCreate?: (input: AddProductInventoryType) => void;
    onUpdate?: (input :UpdateProductContractType) => void;
    response: FormErrors | {message:string} | undefined,
    onCancel:()=>void,
    status?:number,
    contractId:number
}

const ProductInventoryForm = ({ data:productData, onCreate, onUpdate, response, onCancel, status, contractId }: FormProps) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            note: productData?.note || "",
            contractQuantity:productData?.contractQuantity || 0,
            productId:productData?.productId
        }
    });

    const [searchParams, setSearchParams] = useState<SearchParams>({
        searchBy: "name",
        searchValue: "",
        page: 1,
        sortBy: "name",
        sortType: "ASC",
        limit: 10
    });

    const [inputValue, setInputValue] = useState(productData?.product.name || "");
    const [showOptions, setShowOptions] = useState(false);
    const {data, refetch} = useGetProducts(searchParams);
    const [selectUnit, setSelectUnit] = useState<string>("")

    // Загрузка вариантов при изменении inputValue
    useEffect(() => {
            if (inputValue.length > 1) {
                setSearchParams(prev => ({...prev, searchValue: inputValue}));
                refetch();
            }
    }, [inputValue]);

    // Установка начального значения для input
    useEffect(() => {
        if (productData?.productId && data?.data?.rows) {
            const product = data.data.rows.find(u => u.id === productData.productId);
            if (product) {
                setInputValue(product.name);
            }
        }
    }, [productData, data]);

    const handleProductSelect = (unitId: number, unitName: string) => {
        form.setValue('productId', unitId);
        setInputValue(unitName);
        setShowOptions(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setSearchParams({...searchParams, searchValue:e.target.value})
        setShowOptions(true);
    };

    const handleSubmit = (input: AddProductInventoryType) => {
        if (onCreate) {
            onCreate({...input,contractId });
        } else if (onUpdate && productData?.id && productData?.contractId) {
            onUpdate({ id: productData.id, note:input.note, contractQuantity:input.contractQuantity})
        }else{
            toast.error("Error server, try later");
        }
    };

    useEffect(() => {

        if (response && isFormErrors(response) && status && status >= 400 && status < 500) {
            const errorFields = Object.keys(response.details) as Array<keyof FormValues>;


            errorFields.forEach(field => {
                if (field in form.getValues()) {
                    form.setError(field, {
                        type: "manual",
                        message: response.details[field].join(", "),
                    });
                }
            });


            if (errorFields.length === 0 ) {
                toast.error(response.message);
            }

            if(Object.keys(response.details).length === 1 && Object.keys(response.details)[0] === 'contractId'){
                toast.error( response?.details?.contractId.join(", "));
            }
        }

    }, [response, form, status]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">


                <FormItem>
                    <FormLabel
                        className={onUpdate? "text-gray-500" : ""}
                    >Продукт</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input
                                readOnly={typeof onUpdate === 'function'}
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="Выберите продукт..."
                                onFocus={() => setShowOptions(true)}
                                list="unit-options"
                                className={onUpdate? "text-gray-500" : ""}
                            />
                            {showOptions &&  onCreate && data?.data?.rows && data.data.rows.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                    {data.data.rows.map(productValue => (
                                        <div
                                            key={productValue.id}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                handleProductSelect(productValue.id, productValue.name)
                                                setSelectUnit(productValue.unit.symbol)
                                            }}
                                        >
                                            {productValue.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </FormControl>
                    {form.formState.errors.productId && (
                        <FormMessage>{form.formState.errors.productId.message}</FormMessage>
                    )}
                </FormItem>

                <FormField
                    control={form.control}
                    name="contractQuantity"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{selectUnit && selectUnit !== '' ? `Количество по контракту в (${selectUnit})}` : `Количество по контракту`}</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" min="0" {...field}
                                       onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Заметка</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Additional notes" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Закрыть
                    </Button>
                    <Button type="submit">
                        {onCreate ? 'Добавить' : 'Обновить'} Продукт
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default ProductInventoryForm;
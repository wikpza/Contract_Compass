import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import { z } from 'zod';
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

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters'
    }),
    unitId: z.number().min(1, "Please select a unit"),
    note: z.string().optional().or(z.literal(''))
});
type FormValues = z.infer<typeof formSchema>;

interface FormProps {
    data?: GetProductType;
    onCreate?: (input: CreateProductType) => void;
    onUpdate?: (input :UpdateProductType) => void;
    response: FormErrors | {message:string} | undefined,
    onCancel:()=>void,
    status?:number
}

const ProductForm = ({ data:productData, onCreate, onUpdate, response, onCancel, status }: FormProps) => {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: productData?.name || '',
            note: productData?.note || "",
            unitId: productData?.unitId || undefined
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

    const [inputValue, setInputValue] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const {data, refetch} = useGetUnits(searchParams);

    // Загрузка вариантов при изменении inputValue
    useEffect(() => {
            if (inputValue.length > 1) {
                setSearchParams(prev => ({...prev, searchValue: inputValue}));
                refetch();
            }
    }, [inputValue]);

    // Установка начального значения для input
    useEffect(() => {
        if (productData?.unitId && data?.data?.rows) {
            const unit = data.data.rows.find(u => u.id === productData.unitId);
            if (unit) {
                setInputValue(unit.name);
            }
        }
    }, [productData, data]);

    const handleUnitSelect = (unitId: number, unitName: string) => {
        form.setValue('unitId', unitId);
        setInputValue(unitName);
        setShowOptions(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setSearchParams({...searchParams, searchValue:e.target.value})
        setShowOptions(true);
    };

    const handleSubmit = (input: CreateProductType) => {
        if (onCreate) {
            onCreate(input);
        } else if (onUpdate && productData?.id) {
            onUpdate({...input, id: productData.id});
        } else {
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

            if (errorFields.length === 0) {
                toast.error(response.message);
            }
        }
    }, [response, form, status]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Имя</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Название товара" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormItem>
                    <FormLabel>Единица измерения</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="Выберите единицу..."
                                onFocus={() => setShowOptions(true)}
                                list="unit-options"
                            />
                            {showOptions && data?.data?.rows && data.data.rows.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                    {data.data.rows.map(unit => (
                                        <div
                                            key={unit.id}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleUnitSelect(unit.id, unit.name)}
                                        >
                                            {`ID - ${unit.id}, ${unit.name}`}
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </FormControl>
                    {form.formState.errors.unitId && (
                        <FormMessage>{form.formState.errors.unitId.message}</FormMessage>
                    )}
                </FormItem>

                <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Заметка</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Заметка" />
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
                        {onCreate ? 'Создать' : 'Обновить'} Продукт
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default ProductForm;
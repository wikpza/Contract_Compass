
import React, {useEffect, useState} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import {FormErrors, isFormErrors} from "@/lib/errors";
import {toast} from "sonner";
import {Textarea} from "@/components/ui/textarea.tsx";
import {CreateContractType, GetContractType, UpdateContractType} from "@/types/Contract.ts";
import {Link, useParams} from "react-router-dom";
import {ArrowLeftCircle, CalendarIcon} from "lucide-react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {cn} from "@/lib/utils.ts";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar.tsx";
import {SearchParams} from "@/types";
import {useGetApplicants} from "@/api/Applicant.api.ts";
import {useGetPurchasers} from "@/api/Purchaser.api.ts";
import {useGetCompany} from "@/api/Company.api.ts";
import {useGetCurrency} from "@/api/Currency.api.ts";
import {GetProjectType} from "@/types/Project.ts";

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Название должно быть больше 2 символов'
    }),
    type: z.enum(['product', 'service']),
    applicantId: z.number().min(1, "Заявитель обязателен"),
    purchaserId: z.number().min(1, "Закупщик обязателен"),
    companyId: z.number().min(1, "Компания обязательна"),
    amount: z.coerce.number().positive("Сумма контракта должна быть положительна"),
    currencyId: z.number().min(1, "Валюта обязательна"),
    projectCurrencyExchangeRate: z.coerce.number().positive("Курс валюты должен быть положительным").optional().nullable(),

    officialBeginDate: z.date({ required_error: "Дата обязательная" }),
    officialFinishDate: z.date({ required_error: "Дата обязательна" }),
    signDate: z.date({ required_error: "Дата обязательна" }),

    note: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;
type CreateContractFormType = {
    name:string,
    type:string,
    applicantId:number,
    purchaserId:number,
    companyId:number,
    currencyId:number,
    amount:number,

    signDate:Date,
    officialBeginDate:Date,
    officialFinishDate:Date,

    projectCurrencyExchangeRate?:number,
    note?:string,
}


interface FormProps {
    project:GetProjectType,
  data: GetContractType;
  onUpdate?: (input :UpdateContractType) => void;
  response: FormErrors | {message:string} | undefined,
    onCancel:()=>void,
    status?:number
}

const ContractForm = ({ data, onUpdate, response, status, onCancel, project }: FormProps) => {


  const form = useForm<CreateContractFormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: data?.name || '',
        type: (data?.type === 'service' || data?.type === 'product')? data?.type :null,
        companyId:data?.companyId ,
        applicantId:data?.companyId,
        purchaserId:data?.companyId ,
        currencyId:data?.currencyId ,
        amount:data?.amount ,
        signDate:new Date(data?.signDate),
        officialBeginDate:new Date(data?.officialBeginDate),
        officialFinishDate:new Date(data?.officialFinishDate),
        note:data?.note || "",
        projectCurrencyExchangeRate:data?.projectCurrencyExchangeRate || null
    }
  });

    const [searchApplicantParams, setSearchApplicantParams] = useState<SearchParams>({
        searchBy: "name",
        searchValue: "",
        page: 1,
        sortBy: "name",
        sortType: "ASC",
        limit: 10
    });
    const [searchPurchaserParams, setSearchPurchaserParams] = useState<SearchParams>({
        searchBy: "name",
        searchValue: "",
        page: 1,
        sortBy: "name",
        sortType: "ASC",
        limit: 10
    });
    const [searchCompanyParams, setSearchCompanyParams] = useState<SearchParams>({
        searchBy: "name",
        searchValue: "",
        page: 1,
        sortBy: "name",
        sortType: "ASC",
        limit: 10
    });
    const [searchCurrencyParams, setSearchCurrencyParams] = useState<SearchParams>({
        searchBy: "name",
        searchValue: "",
        page: 1,
        sortBy: "name",
        sortType: "ASC",
        limit: 10
    });

    const [inputApplicantValue, setApplicantInputValue] = useState(data.applicant.name);
    const [showApplicantOptions, setShowApplicantOptions] = useState(false);

    const [inputPurchaserValue, setPurchaserInputValue] = useState(data.purchaser.name);
    const [showPurchaserOptions, setShowPurchaserOptions] = useState(false);

    const [inputCompanyValue, setCompanyInputValue] = useState(data.company.name);
    const [showCompanyOptions, setShowCompanyOptions] = useState(false);

    const [inputCurrencyValue, setCurrencyInputValue] = useState(data.currency.name);
    const [showCurrencyOptions, setShowCurrencyOptions] = useState(false);


    const handleCompanySelect = (unitId: number, unitName: string) => {
        form.setValue('companyId', unitId);
        setCompanyInputValue(unitName);
        setShowPurchaserOptions(false);
        setShowApplicantOptions(false);
        setShowCompanyOptions(false);
        setShowCurrencyOptions(false);
    };
    const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCompanyInputValue(e.target.value);
        setSearchCompanyParams({...searchCompanyParams, searchValue:e.target.value})
        setShowCompanyOptions(true);

        setShowPurchaserOptions(false);
        setShowApplicantOptions(false);
        setShowCurrencyOptions(false);
    };

    const handlePurchaserSelect = (unitId: number, unitName: string) => {
        form.setValue('purchaserId', unitId);
        setPurchaserInputValue(unitName);
        setShowPurchaserOptions(false);

        setShowApplicantOptions(false);
        setShowCompanyOptions(false);
        setShowCurrencyOptions(false);
    };
    const handlePurchaserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPurchaserInputValue(e.target.value);
        setSearchPurchaserParams({...searchPurchaserParams, searchValue:e.target.value})
        setShowPurchaserOptions(true);

        setShowApplicantOptions(false);
        setShowCompanyOptions(false);
        setShowCurrencyOptions(false);
    };

    const handleApplicantSelect = (unitId: number, unitName: string) => {
        form.setValue('applicantId', unitId);
        setApplicantInputValue(unitName);

        setShowPurchaserOptions(false);
        setShowApplicantOptions(false);
        setShowCompanyOptions(false);
        setShowCurrencyOptions(false);
    };
    const handleApplicantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setApplicantInputValue(e.target.value);
        setSearchApplicantParams({...searchApplicantParams, searchValue:e.target.value})
        setShowApplicantOptions(true);

        setShowPurchaserOptions(false);
        setShowCompanyOptions(false);
        setShowCurrencyOptions(false);

    };

    const handleCurrencySelect = (unitId: number, unitName: string) => {
        form.setValue('currencyId', unitId);
        setCurrencyInputValue(unitName);
        setShowPurchaserOptions(false);
        setShowApplicantOptions(false);
        setShowCompanyOptions(false);
        setShowCurrencyOptions(false);
    };
    const handleCurrencyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrencyInputValue(e.target.value);
        setSearchCurrencyParams({...searchCurrencyParams, searchValue:e.target.value})
        setShowCurrencyOptions(true);

        setShowPurchaserOptions(false);
        setShowApplicantOptions(false);
        setShowCompanyOptions(false);
    };

    const {data:applicants, refetch:applicantRefetch} = useGetApplicants(searchApplicantParams)
    const {data:purchasers, refetch:purchaserRefetch} = useGetPurchasers(searchPurchaserParams)
    const {data:companies, refetch:companyRefetch} = useGetCompany(searchCompanyParams)
    const {data:currencies, refetch:currencyRefetch} = useGetCurrency(searchCurrencyParams)



    useEffect(() => {
        setSearchApplicantParams(prev => ({...prev, searchValue: inputApplicantValue}));
        applicantRefetch();
    }, [inputApplicantValue]);
    useEffect(() => {
        setSearchPurchaserParams(prev => ({...prev, searchValue: inputPurchaserValue}));
        purchaserRefetch();
    }, [inputPurchaserValue]);
    useEffect(() => {
        setSearchCompanyParams(prev => ({...prev, searchValue: inputCompanyValue}));
        companyRefetch();
    }, [inputCompanyValue]);
    useEffect(() => {
        setSearchCurrencyParams(prev => ({...prev, searchValue: inputCurrencyValue}));
        currencyRefetch();
    }, [inputCurrencyValue]);
    useEffect(() => {
    }, [companies, currencies, applicants, purchasers]);




    const handleSubmit = (values: CreateContractFormType) => {

      if(values.signDate > values.officialBeginDate) {
          form.setError("signDate", {
              type: "manual",
              message: "Дата контракта не может быть позже подписания контракта",
          });
          return
      }

      if(values.officialFinishDate < values.officialBeginDate) {
          form.setError("officialFinishDate", {
              type: "manual",
              message: "Дата завершения контракта не может быть раньше начала контракта",
          });
          return
      }


      const findCurrency = (currencies?.data?.rows.find(value => value?.id === form.getValues('currencyId'))?.name)

        console.log("find Currency ",findCurrency)
        console.log("input value ",inputCurrencyValue)


      if(!findCurrency || inputCurrencyValue !== findCurrency){
         toast.error("Выберите валюту.")
          return
      }

        onUpdate({...values, id:data?.id,  projectId:project.id})


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


    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <h2 className="text-2xl font-bold">Страница не найдена</h2>
                <p className="text-muted-foreground mt-2 mb-6">Не удалось найти проект, куда вы хотите добавить контракт</p>
                <Button asChild>
                    <Link to="/projects">Вернуться назад</Link>
                </Button>
            </div>
        );
    }

    console.log()
    return (
        <>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Имя</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Название Контракта"/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Тип Контракта</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите тип контракта"/>
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="product">Товар</SelectItem>
                                                    <SelectItem value="service">Услуга</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">


                                <FormItem>
                                    <FormLabel>Заявитель</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                value={inputApplicantValue}
                                                onChange={handleApplicantInputChange}
                                                placeholder="Выберите Заявителя..."
                                                onFocus={() =>{
                                                    setShowApplicantOptions(true)

                                                    setShowPurchaserOptions(false);
                                                    setShowCompanyOptions(false);
                                                    setShowCurrencyOptions(false);
                                                }
                                                }
                                                list="applicant-options"
                                            />
                                            {showApplicantOptions && applicants?.data?.rows && applicants.data.rows.length > 0 && (
                                                <div
                                                    className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                    {applicants?.data?.rows.map(unit => (
                                                        <div
                                                            key={unit.id}
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => handleApplicantSelect(unit.id, unit.name)}
                                                        >
                                                            {unit.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </FormControl>
                                    {form.formState.errors.applicantId && (
                                        <FormMessage>{form.formState.errors.applicantId.message}</FormMessage>
                                    )}
                                </FormItem>

                                <FormItem>
                                    <FormLabel>Закупщик</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                value={inputPurchaserValue}
                                                onChange={handlePurchaserInputChange}
                                                placeholder="Выберите Закупщика..."
                                                onFocus={() => {
                                                    setShowPurchaserOptions(true)

                                                    setShowApplicantOptions(false);
                                                    setShowCompanyOptions(false);
                                                    setShowCurrencyOptions(false);
                                                }}
                                                list="purchaser-options"
                                            />
                                            {showPurchaserOptions && applicants?.data?.rows && applicants.data.rows.length > 0 && (
                                                <div
                                                    className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                    {purchasers?.data?.rows.map(unit => (
                                                        <div
                                                            key={unit.id}
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => handlePurchaserSelect(unit.id, unit.name)}
                                                        >
                                                            {unit.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </FormControl>
                                    {form.formState.errors.purchaserId && (
                                        <FormMessage>{form.formState.errors.purchaserId.message}</FormMessage>
                                    )}
                                </FormItem>

                                <FormItem>
                                    <FormLabel>Компания</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                value={inputCompanyValue}
                                                onChange={handleCompanyInputChange}
                                                placeholder="Выберите Компанию..."
                                                onFocus={() => {
                                                    setShowCompanyOptions(true)

                                                    setShowPurchaserOptions(false);
                                                    setShowApplicantOptions(false);
                                                    setShowCurrencyOptions(false);
                                                }}
                                                list="company-options"
                                            />
                                            {showCompanyOptions && applicants?.data?.rows && applicants.data.rows.length > 0 && (
                                                <div
                                                    className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                    {companies?.data?.rows.map(unit => (
                                                        <div
                                                            key={unit.id}
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => handleCompanySelect(unit.id, unit.name)}
                                                        >
                                                            {unit.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </FormControl>
                                    {form.formState.errors.companyId && (
                                        <FormMessage>{form.formState.errors.companyId.message}</FormMessage>
                                    )}
                                </FormItem>

                                <FormItem>
                                    <FormLabel>Валюта</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                value={inputCurrencyValue}
                                                onChange={handleCurrencyInputChange}
                                                placeholder="Выберите Валюта..."
                                                onFocus={() => {
                                                    setShowCurrencyOptions(true)

                                                    setShowPurchaserOptions(false);
                                                    setShowApplicantOptions(false);
                                                    setShowCompanyOptions(false);
                                                }}
                                                list="currency-options"
                                            />
                                            {showCurrencyOptions && applicants?.data?.rows && applicants.data.rows.length > 0 && (
                                                <div
                                                    className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                                                    {currencies?.data?.rows.map(unit => (
                                                        <div
                                                            key={unit.id}
                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                            onClick={() => handleCurrencySelect(unit.id, unit.name)}
                                                        >
                                                            {unit.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </FormControl>
                                    {form.formState.errors.currencyId && (
                                        <FormMessage>{form.formState.errors.currencyId.message}</FormMessage>
                                    )}
                                </FormItem>

                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>{`Сумма контракта`}</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" min="0" {...field}
                                                       onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                {
                                    (currencies && currencies?.data?.rows && form.getValues("currencyId") && form.getValues("currencyId") !== project.currencyId)
                                    &&
                                    (
                                        <FormField
                                            control={form.control}
                                            name="projectCurrencyExchangeRate"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>{`Курс Валюты для ${(currencies?.data?.rows.find(value => value?.id === form.getValues('currencyId'))?.code)} - ${project.currency.code}`}</FormLabel>
                                                    <FormControl>
                                                        <Input type="number"
                                                               step="0.000001"
                                                               min="0" {...field}
                                                               onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}/>
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    )
                                }
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">

                                <FormField
                                    control={form.control}
                                    name="signDate"
                                    render={({field}) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Дата подписания контракта</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Выберите дату</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                        className={cn("p-3 pointer-events-auto")}
                                                    />
                                                </PopoverContent>
                                            </Popover>

                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="officialBeginDate"
                                    render={({field}) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Дата начала контракта</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Выберите дату</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                        className={cn("p-3 pointer-events-auto")}
                                                    />
                                                </PopoverContent>
                                            </Popover>

                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="officialFinishDate"
                                    render={({field}) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Дата завершения контракта</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Выберите дату</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                        className={cn("p-3 pointer-events-auto")}
                                                    />
                                                </PopoverContent>
                                            </Popover>

                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="note"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Описание контракта</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Дополнительная информация"
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={onCancel}
                                >
                                    Отмена
                                </Button>
                                <Button type="submit">Обновить договор</Button>
                            </div>
                        </form>
                    </Form>

        </>
    );
};

export default ContractForm;

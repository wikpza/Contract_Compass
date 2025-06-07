
import React, {useEffect, useState} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';

import {CreateUnitType, GetUnitType, UpdateUnitType} from "@/types/Unit.ts";
import {FormErrors, isFormErrors} from "@/lib/errors";
import {toast} from "sonner";
import {CreateApplicantType, GetApplicantType, UpdateApplicantType} from "@/types/Applicant.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {CreatePaymentType} from "@/types/Payment.ts";
import {SearchParams} from "@/types";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import currencies from "@/pages/Currencies.tsx";
import {useGetCurrency} from "@/api/Currency.api.ts";
import {GetContractType} from "@/types/Contract.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {cn} from "@/lib/utils.ts";
import {format} from "date-fns";
import {CalendarIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar.tsx";

type CreatePaymentFormType = {
    type:string,
    amount:number,
    contractCurrencyExchangeRate:number,
    giveDate:Date,
}
const formSchema = z.object({

    type: z.enum(['issued', 'refund']),
    amount: z.coerce.number().positive("Сумма контракта должна быть положительна"),
    contractCurrencyExchangeRate: z.coerce.number().positive("Курс валюты должен быть положительным").optional().nullable(),
    currencyId: z.number().min(1, "Валюта обязательна"),
    giveDate: z.date({ required_error: "Дата обязательна" }),
    note: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;


interface FormProps {
    contract:GetContractType,
  onCreate?: (input: CreatePaymentType) => void;
  response: FormErrors | {message:string} | undefined,
    status?:number

}

const PaymentForm = ({  contract, onCreate, response, status }: FormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
      defaultValues:{giveDate:new Date()}
  });

    const [searchCurrencyParams, setSearchCurrencyParams] = useState<SearchParams>({
        searchBy: "name",
        searchValue: "",
        page: 1,
        sortBy: "name",
        sortType: "ASC",
        limit: 10
    });

    const [inputCurrencyValue, setCurrencyInputValue] = useState("");
    const [showCurrencyOptions, setShowCurrencyOptions] = useState(false);

    const {data:currencies, refetch} = useGetCurrency(searchCurrencyParams)
    const handleCurrencySelect = (unitId: number, unitName: string) => {
        form.setValue('currencyId', unitId);
        setCurrencyInputValue(unitName);
        setShowCurrencyOptions(false);
    };
    const handleCurrencyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrencyInputValue(e.target.value);
        setSearchCurrencyParams({...searchCurrencyParams, searchValue:e.target.value})
        setShowCurrencyOptions(true);
    };

    const handleSubmit = (input) => {
      onCreate(
          {
              type:input.type,
              contractId:contract.id,
              currencyId:input.currencyId,
              giveDate:input.giveDate,
              amount:input.amount,
              contractCurrencyExchangeRate:input.contractCurrencyExchangeRate,
              note:input.note
          }
      )
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

    useEffect(() => {
        setSearchCurrencyParams(prev => ({...prev, searchValue: inputCurrencyValue}));
        refetch();
    }, [inputCurrencyValue]);

    useEffect(() => {
    }, [currencies]);




    return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">


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
                                  <SelectValue placeholder="Выберите тип Транзакции"/>
                              </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="issued">Взнос</SelectItem>
                              <SelectItem value="refund">Возврат средств</SelectItem>
                          </SelectContent>
                      </Select>
                      <FormMessage/>
                  </FormItem>
              )}
          />

          <FormField
              control={form.control}
              name="amount"
              render={({field}) => (
                  <FormItem>
                      <FormLabel>{`Сумма транзакции`}</FormLabel>
                      <FormControl>
                          <Input type="number"  step={'0.000001'} min="0" {...field}
                                 onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}/>
                      </FormControl>
                      <FormMessage/>
                  </FormItem>
              )}
          />



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

                          }}
                          list="currency-options"
                      />
                      {showCurrencyOptions && currencies?.data?.rows && currencies.data.rows.length > 0 && (
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

          {
              (currencies && currencies?.data?.rows && form.getValues("currencyId") && form.getValues("currencyId") !== contract.currencyId)
              &&
              (
                  <FormField
                      control={form.control}
                      name="contractCurrencyExchangeRate"
                      render={({field}) => (
                          <FormItem>
                              <FormLabel>{`Курс Валюты для ${(currencies?.data?.rows.find(value => value.id === form.getValues('currencyId')).code)} - ${contract.currency.code}`}</FormLabel>
                              <FormControl>
                                  <Input type="number"   step={'0.000001'} min="0" {...field}
                                         onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}/>
                              </FormControl>
                              <FormMessage/>
                          </FormItem>
                      )}
                  />
              )
          }
          <FormField
              control={form.control}
              name="giveDate"
              render={({field}) => (
                  <FormItem className="flex flex-col">
                      <FormLabel>Дата Транзакции</FormLabel>
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

          <Button type="submit">
            Совершить транзакцию
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentForm;

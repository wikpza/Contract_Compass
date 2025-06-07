
import React, {useEffect} from 'react';
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
import {CreateCurrencyType, GetCurrencyType, UpdateCurrencyType} from "@/types/Currency.ts";

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters'
    }),
    code: z.string()
        .length(3, {
            message: 'Code must be exactly 3 characters'
        })
        .regex(/^[A-Z]{3}$/, {
            message: 'Code must be 3 uppercase letters'
        }),
    symbol: z.string()
        .length(1, {
            message: 'Symbol must be exactly 1 character'
        })

});
type FormValues = z.infer<typeof formSchema>;

interface FormProps {
  data?: GetCurrencyType;
  onCreate?: (input: CreateCurrencyType) => void;
  onUpdate?: (input :UpdateCurrencyType) => void;
  response: FormErrors | {message:string} | undefined,
    onCancel:()=>void,
    status?:number
}

const CurrencyForm = ({ data, onCreate, onUpdate, response, onCancel, status }: FormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || '',
        symbol:data?.symbol || "",
        code:data?.code || "",
    }
  });

  const handleSubmit = (input: CreateCurrencyType) => {

    if(onCreate){
        onCreate(input)
    }else if(onUpdate && data && data?.id){
        onUpdate({...input, id:data?.id})
    }else{
       toast.error("Error server, try later")
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
                          <Input {...field} placeholder="Название (Доллары)" />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />



          <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>Код</FormLabel>
                      <FormControl>
                          <Input {...field} placeholder="Код валюты (USD)" />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />

          <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>Символ</FormLabel>
                      <FormControl>
                          <Input {...field} placeholder="Символ ($)" />
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
            {onCreate ? 'Создать' : 'Обновить'} Валюту
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CurrencyForm;


import React, {useEffect, useState} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';
import {FormErrors, isFormErrors} from "@/lib/errors";
import {toast} from "sonner";
import {Textarea} from "@/components/ui/textarea.tsx";
import {CreatePaymentType, FinishPaymentType} from "@/types/Payment.ts";
import currencies from "@/pages/Currencies.tsx";
import {GetContractType} from "@/types/Contract.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {cn} from "@/lib/utils.ts";
import {format} from "date-fns";
import {CalendarIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar.tsx";
import {Input} from "@/components/ui/input.tsx";

type FinishPaymentFormType = {
    giveDate:Date,
    note?:string
}
const formSchema = z.object({
    giveDate: z.date({ required_error: "Дата обязательна" }),
    note: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;


interface FormProps {
    contract:GetContractType,
  onCreate?: (input: FinishPaymentType) => void;
  response: FormErrors | {message:string} | undefined,
    status?:number,
    lastSum:string
}

const FinishPaymentForm = ({  contract, onCreate, response, status, lastSum }: FormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
      defaultValues:{giveDate:new Date()}
  });

    const handleSubmit = (input) => {
      onCreate(
          {
              contractId:contract.id,
              giveDate:input.giveDate,
              note:input.note,

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
    }, [currencies]);




    return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

          <FormLabel>{`Оставшаяся сумма`}</FormLabel>
          <Input  min="0" readOnly={true} value={lastSum}/>

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

export default FinishPaymentForm;

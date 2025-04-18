
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters'
  }),
  symbol: z.string().min(1, {
    message: 'Abbreviation is required'
  }).max(10, {
    message: 'Abbreviation must be at most 10 characters'
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface UnitFormProps {
  unit?: GetUnitType;
  onCreate?: (unit: CreateUnitType) => void;
  onUpdate?: (unit:UpdateUnitType) => void;
  response: FormErrors | {message:string} | undefined,
    onCancel:()=>void,
    status?:number
}

const UnitForm = ({ unit, onCreate, onUpdate, response, onCancel, status }: UnitFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: unit?.name || '',
        symbol: unit?.symbol || '',
    }
  });

  const handleSubmit = (data: CreateUnitType) => {

    if(onCreate){
        onCreate(data)
    }else if(onUpdate && unit && unit?.id){
        onUpdate({...data, id:unit?.id})
    }else{
       toast.error("Error server, try later")
    }

  };

    useEffect(() => {
        console.log(response, status)
        if (response  && isFormErrors(response) && status && status >= 400 && status < 500) {
            console.log(1)
            if ("name" in response.details) {
                console.log(2)
                form.setError("name", {
                    type: "manual",
                    message: response.details.name.join(","),
                });
            } else if ("symbol" in response.details) {
                form.setError("symbol", {
                    type: "manual",
                    message:response.details.symbol.join(","),
                });
            }else {
                toast.error(response.message);
            }
        }
    }, [response, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Unit name" />
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
                <Input {...field} placeholder="e.g. kg, pcs, m" />
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
            {onCreate ? 'Создать' : 'Обновить'} Единицу измерения
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UnitForm;

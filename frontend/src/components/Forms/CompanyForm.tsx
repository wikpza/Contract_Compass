
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
import {CreateCompanyType, GetCompanyType, UpdateCompanyType} from "@/types/Company.ts";

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters'
    }),
    email: z.string().email({
        message: 'Please enter a valid email address'
    }).optional().or(z.literal('')),
    phone: z.string().min(5, {
        message: 'Phone number must be at least 5 characters'
    }).optional().or(z.literal('')),
    address: z.string().min(5, {
        message: 'Address must be at least 5 characters'
    }).optional().or(z.literal('')),
    note: z.string().optional().or(z.literal(''))
});
type FormValues = z.infer<typeof formSchema>;

interface FormProps {
  data?: GetCompanyType;
  onCreate?: (input: CreateCompanyType) => void;
  onUpdate?: (input :UpdateCompanyType) => void;
  response: FormErrors | {message:string} | undefined,
    onCancel:()=>void,
    status?:number
}

const CompanyForm = ({ data, onCreate, onUpdate, response, onCancel, status }: FormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || '',
        email:data?.email || "",
        phone:data?.phone || "",
        address:data?.address || "",
        note:data?.note || "",

    }
  });

  const handleSubmit = (input: CreateCompanyType) => {

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
                          <Input {...field} placeholder="Full name" />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />

          <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>Почта</FormLabel>
                      <FormControl>
                          <Input {...field} type="email" placeholder="Email address" />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />

          <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>Телефон</FormLabel>
                      <FormControl>
                          <Input {...field} placeholder="Phone number" />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />

          <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>Адресс</FormLabel>
                      <FormControl>
                          <Input {...field} placeholder="Address" />
                      </FormControl>
                      <FormMessage />
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
            {onCreate ? 'Создать' : 'Обновить'} Компанию
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CompanyForm;

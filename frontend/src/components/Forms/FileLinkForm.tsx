
import React, {useEffect} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form.tsx';

import {FormErrors, isFormErrors} from "@/lib/errors";
import {toast} from "sonner";
import {CreateApplicantType, GetApplicantType, UpdateApplicantType} from "@/types/Applicant.ts";
import {Textarea} from "@/components/ui/textarea.tsx";
import {CreateFileLinkType, GetFileLinkType, UpdateFileLinkType} from "@/types/FileLink.ts";

const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Name must be at least 2 characters'
    }),
    url: z.string()
});
type FormValues = z.infer<typeof formSchema>;

interface FormProps {
  data?: GetFileLinkType;
  contractId:number,
  onCreate?: (input: CreateFileLinkType) => void;
  onUpdate?: (input :UpdateFileLinkType) => void;
  response: FormErrors | {message:string} | undefined,
    onCancel:()=>void,
    status?:number
}

const FileLinkForm = ({ data, onCreate, onUpdate, response, onCancel, status, contractId}: FormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || '',
        url:data?.url || '',

    }
  });

  const handleSubmit = (input: {name:string, url:string}) => {

    if(onCreate){
        onCreate({name:input.name, url:input.url, contractId})
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
                      <FormLabel>Название</FormLabel>
                      <FormControl>
                          <Input {...field} placeholder="Название" />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />


          <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>Ссылка</FormLabel>
                      <FormControl>
                          <Input {...field} placeholder="ссылка" />
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
            {onCreate ? 'Создать' : 'Обновить'} Ссылку
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default FileLinkForm;

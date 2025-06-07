
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {CalendarIcon, PackageCheck, PackageX} from "lucide-react";
import {AddInventorySessionType} from "@/types/Inventory.ts";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {cn} from "@/lib/utils.ts";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar.tsx";

const formSchema = z.object({
    type: z.enum(['issued', 'refund']),
    amount: z.coerce.number().positive("Количество должно быть положительным"),
    note: z.string().optional(),
    giveDate: z.date({ required_error: "Дата обязательна" }),
});
type FormValues = z.infer<typeof formSchema>;

interface FormProps {
  id?: number;
  onCreate?: (input: AddInventorySessionType) => void;
  response: FormErrors | {message:string} | undefined,
    onCancel:()=>void,
    status?:number
}

const ApplicantForm = ({ id, onCreate, response, onCancel, status }: FormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

  });

  const handleSubmit = (input) => {


      onCreate(
          {
              id,
              type:input.type,
              amount:input?.amount | 0,
              note:input.note,
              giveDate:input.giveDate
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
    //
    // useEffect(()=>{
    //
    // }, [form.getValues('type')])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
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
                                      <SelectItem value="issued">
                                          <PackageCheck className="mr-2 h-4 w-4 inline"/>
                                          Получение товара
                                      </SelectItem>

                                      <SelectItem value="refund">
                                          <PackageX className="mr-2 h-4 w-4 inline"/>
                                          Возврат товара
                                      </SelectItem>
                                  </SelectContent>
                              </Select>
                              <FormMessage/>
                          </FormItem>
                      )}
                  />
              </div>
              <div className="space-y-2">
                  <FormField
                      control={form.control}
                      name="amount"
                      render={({field}) => (
                          <FormItem>
                              <FormLabel>{`Количество`}</FormLabel>
                              <FormControl>
                                  <Input type="number" step="0.000001" min="0" {...field}
                                         onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}/>
                              </FormControl>
                              <FormMessage/>
                          </FormItem>
                      )}
                  />
              </div>
              </div>

          <FormField
              control={form.control}
              name="giveDate"
              render={({field}) => (
                  <FormItem className="flex flex-col">
                      <FormLabel>Дата получения</FormLabel>
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

                  <Button type="button" variant="outline" onClick={onCancel}>
                      Закрыть
                  </Button>

                  <Button type="submit">
                      {form.getValues('type') && form.getValues('type').toString() == 'issued' ? (
                          <>
                              <PackageCheck className="mr-2 h-4 w-4"/>
                              Получение товара
                          </>
                      ) : (
                          <>
                              <PackageX className="mr-2 h-4 w-4"/>
                              Возврат товара
                          </>
                      )}
                  </Button>
              </div>
      </form>
    </Form>
);
};

export default ApplicantForm;

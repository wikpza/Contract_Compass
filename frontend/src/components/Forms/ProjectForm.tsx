
import React, {useEffect, useState} from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form.tsx';
import {FormErrors, isFormErrors} from "@/lib/errors";
import {toast} from "sonner";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {cn} from "@/lib/utils.ts";
import {format} from "date-fns";
import {Calendar} from "@/components/ui/calendar.tsx";
import {CalendarIcon} from "lucide-react";
import {CreateProjectType, GetProjectType, UpdateProjectType} from "@/types/Project.ts";
import {SearchParams} from "@/types";
import {useGetCurrency} from "@/api/Currency.api.ts";


const formSchema = z.object({
    name: z.string().min(2, {
        message: 'Должно быть больше двух символов'
    }),
    currencyId: z.number().min(1, "Выберите валюту"),
    note: z.string().optional().or(z.literal('')),
    startDate: z.date({ required_error: "Дата обязательная" }),
    finishDate: z.date({ required_error: "Дата обязательна" }),
});
type FormValues = z.infer<typeof formSchema>;

interface FormProps {
    data?: GetProjectType;
    onCreate?: (input: CreateProjectType) => void;
    onUpdate?: (input :UpdateProjectType) => void;
  response: FormErrors | {message:string} | undefined,
    onCancel:()=>void,
    status?:number
}

const ProjectForm = ({data:projectData, onCreate, response, onCancel, status, onUpdate }: FormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
      defaultValues:{
        name:projectData?.name || "",
          note:projectData?.note || "",
          startDate: projectData?.startDate? new Date(projectData?.startDate) : null,
          finishDate:projectData?.finishDate? new Date(projectData?.finishDate) : null,
        currencyId: projectData?.currencyId || null,

      }
  });

  const handleSubmit = (input: CreateProjectType) => {
      if (onCreate) {
          onCreate(input);
      } else if (onUpdate && projectData?.id) {
          onUpdate({...input, id: projectData.id});
      } else {
          toast.error("Error server, try later");
      }
  };

    const [searchParams, setSearchParams] = useState<SearchParams>({
        searchBy: "code",
        searchValue: "",
        page: 1,
        sortBy: "code",
        sortType: "ASC",
        limit: 10
    });

    const [inputValue, setInputValue] = useState(projectData?.currency?.code || "");
    const [showOptions, setShowOptions] = useState(false);
    const {data, refetch} = useGetCurrency(searchParams);

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
        setSearchParams(prev => ({...prev, searchValue: inputValue}));
        refetch();
    }, [inputValue]);

    // useEffect(() => {
    //     if (productData?.unitId && data?.data?.rows) {
    //         const unit = data.data.rows.find(u => u.id === productData.unitId);
    //         if (unit) {
    //             setInputValue(unit.name);
    //         }
    //     }
    // }, [productData, data]);

    const handleUnitSelect = (unitId: number, unitName: string) => {
        form.setValue('currencyId', unitId);
        setInputValue(unitName);
        setShowOptions(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setSearchParams({...searchParams, searchValue:e.target.value})
        setShowOptions(true);
    };

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
                          <Input {...field} placeholder="Название проекта" />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />

          <FormField
              control={form.control}
              name="startDate"
              render={({field}) => (
                  <FormItem className="flex flex-col">
                      <FormLabel>Дата начала</FormLabel>
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
              name="finishDate"
              render={({field}) => (
                  <FormItem className="flex flex-col">
                      <FormLabel>Дата завершения проекта</FormLabel>
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
                                          <span>Выберите Дату</span>
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


          <FormItem>
              <FormLabel>Валюта</FormLabel>
              <FormControl>
                  <div className="relative">
                      <Input
                          value={inputValue}
                          onChange={handleInputChange}
                          placeholder="Выберите валюту..."
                          onFocus={() => setShowOptions(true)}
                          list="unit-options"
                      />
                      {showOptions && data?.data?.rows && data.data.rows.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                              {data.data.rows.map(unit => (
                                  <div
                                      key={unit.id}
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                      onClick={() => handleUnitSelect(unit.id, unit.code)}
                                  >
                                      {`ID - ${unit.id}, ${unit.code}`}
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
              name="note"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>Заметка</FormLabel>
                      <FormControl>
                          <Textarea {...field} placeholder="Дополнительная информация" />
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
            {onCreate ? 'Создать' : 'Обновить'} Проект
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectForm;

import {useMutation, useQuery} from "react-query";
// import {CreateUnitType, GetUnit, Unit, UpdateUnitType} from "@/types/unit.ts";
import {toast} from "sonner";
import {FormErrors, handleServerError, isFormErrors, isValidJSON} from "@/lib/errors";
import {CreateUnitType, GetUnitType, UpdateUnitType} from "@/types/Unit.ts";
import {SearchParams} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const useGetUnits = (
    input: SearchParams
) => {
    const accessToken = localStorage.getItem('token');

    const getUnitsRequest = async (): Promise<{data?: {count: number, rows: GetUnitType[]}, status: number}> => {
        // Создаем объект URLSearchParams и добавляем параметры
        const params = new URLSearchParams();

        if (input.searchBy ) {
            params.append('searchBy', input.searchBy);
        }

        if (input.searchValue ) {
            params.append('searchValue', input.searchValue);
        }

        if (input.page) {
            params.append('page', input.page.toString());
        }

        if (input.limit) {
            params.append('limit', input.limit.toString());
        }

        if (input.sortType) {
            params.append('sortType', input.sortType || 'ASC'); // По умолчанию сортировка по возрастанию
        }

        if (input.sortBy) {
            params.append('sortBy', input.sortBy);
        }

        const url = `${API_BASE_URL}/unit?${params.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status >= 500 && response.status < 600) {
                toast.error(handleServerError({status: response.status}));
            }
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        return {data: responseData, status: response.status};
    }

    const {data, isLoading, error, refetch} = useQuery(
        ['fetchUnits', input], // Ключ запроса теперь включает параметры
        getUnitsRequest,
        {retry: 1}
    );

    return {data, isLoading, error, refetch};
}

export const useCreateUnit = ()=>{
    const accessToken = localStorage.getItem('token');

    const createUnitRequest = async(input:CreateUnitType):Promise<
        {
            unit?:GetUnitType,
            response?: FormErrors | { message: string};
            status:number
        }> =>{


        const response = await fetch(`${API_BASE_URL}/unit`,
            {
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                    Authorization:`Bearer ${accessToken}`,

                },
                body:JSON.stringify(input)
            })


        const responseData = await response.json();

        if(response && response.status && response.status>=500 && response.status<600){
            toast.error(handleServerError({status:response.status}))
        }


        if (isFormErrors(responseData) &&   response.status >= 400 && response.status < 500) {
            return {response:responseData, status:response.status}
        }



        if (responseData && responseData.message && (response.status !== 200 && response.status !== 201)) {
            return { response: { message: responseData.message}, status:response.status };
        }


        return { unit: responseData, status:response.status };
    }

    const {mutate:create, isLoading, isSuccess, error, data} = useMutation(createUnitRequest, {
        retry:0,
        onSuccess: (data) => {
            if(data?.status === 201)
                toast.success("Единица измерения успешно добавлена");
        },

    })

    return {create, isLoading, error, isSuccess, response:data}
}

export const useUpdateUnit = ()=>{
    const accessToken = localStorage.getItem('token');
    const updateUnitRequest = async(input:UpdateUnitType):Promise<
        {
            unit?:GetUnitType,
            response?: FormErrors | { message: string};
            status:number
        }> =>{

        const response = await fetch(`${API_BASE_URL}/unit/${input.id}`,
            {
                method:"PATCH",
                headers:{
                    "Content-Type": "application/json",
                    Authorization:`Bearer ${accessToken}`,
                },
                body:JSON.stringify({name:input.name, symbol:input.symbol})
            })


        const responseData = await response.json();

        if(response && response.status && response.status>=500 && response.status<600){
            toast.error(handleServerError({status:response.status}))
        }


        if (isFormErrors(responseData) &&   response.status >= 400 && response.status < 500) {
            return {response:responseData, status:response.status}
        }



        if (responseData && responseData.message && (response.status !== 200 && response.status !== 201)) {
            return { response: { message: responseData.message}, status:response.status };
        }


        return { unit: responseData, status:response.status };
    }

    const {mutate:update, isLoading, isSuccess, error, data} = useMutation(updateUnitRequest, {
        retry:0,
        onSuccess: (data) => {
            if(data?.status >= 200 && data?.status < 300)
                toast.success("Единица измерения успешно обновлена");
        },
    })

    return {update, isLoading, error, isSuccess, response:data}
}

export const useDeleteUnit = ()=> {
    const accessToken = localStorage.getItem('token');

    const deleteProductRequest = async (id: number): Promise<
        {
            unit?:GetUnitType,
            response?: FormErrors | { message: string};
            status:number
        }
    > =>{


        const response = await fetch(`${API_BASE_URL}/unit/${id}`,{
            method:"DELETE",
            headers:{
                'Content-Type': "application/json",
                Authorization:`Bearer ${accessToken}`,

            }
        })

        const responseData = await response.json()

        if(response && response.status && response.status>=500 && response.status<600){
            toast.error(handleServerError({status:response.status}))
        }


        if (isFormErrors(responseData) &&   response.status >= 400 && response.status < 500) {
            return {response:responseData, status:response.status}
        }



        if (responseData && responseData.message && (response.status !== 200 && response.status !== 201)) {
            return { response: { message: responseData.message}, status:response.status };
        }


        return { unit: responseData, status:response.status };
    }

    const {
        mutateAsync:deleteObj,
        isLoading,
        error,
        isSuccess,
        data
    } = useMutation("DeleteUnit", deleteProductRequest, {
        retry:0,
        onSuccess: (data) => {
            if(data && data.status && data?.status >= 200 && data?.status < 300) toast.success('Единица измерения успешно удалена');
            if(data && data.status && data?.status === 409) toast.error(data.response.message);
        },

    })
    return {
        deleteObj,
        isLoading,
        error,
        isSuccess,
        data
    }
}
import {useMutation, useQuery} from "react-query";
import {toast} from "sonner";
import {FormErrors, handleServerError, isFormErrors, isValidJSON} from "@/lib/errors";
import {SearchParams} from "@/types";
import {CreatePurchaserType, GetPurchaserType, UpdatePurchaserType} from "@/types/Purchaser.ts";
import {CreateApplicantType} from "@/types/Applicant.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const useGetPurchasers = (
    input: SearchParams
) => {
    const accessToken = localStorage.getItem('token');

    const getRequest = async (): Promise<{data?: {count: number, rows: GetPurchaserType[]}, status: number}> => {
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

        const url = `${API_BASE_URL}/purchaser?${params.toString()}`;

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
        ['fetchPurchaser', input], // Ключ запроса теперь включает параметры
        getRequest,
        {retry: 1}
    );

    return {data, isLoading, error, refetch};
}

export const useCreatePurchaser = ()=>{
    const accessToken = localStorage.getItem('token');

    const createRequest = async(input:CreatePurchaserType):Promise<
        {
            unit?:GetPurchaserType,
            response?: FormErrors | { message: string};
            status:number
        }> =>{

        const inputData:CreatePurchaserType = {name:""}

        if(input.name && input.name !== "") inputData.name = input.name
        if(input.address && input.address !== "") inputData.address = input.address
        if(input.phone && input.phone !== "") inputData.phone = input.phone
        if(input.email && input.email !== "") inputData.email = input.email
        if(input.note && input.note !== "") inputData.note = input.note


        const response = await fetch(`${API_BASE_URL}/purchaser`,
            {
                method:"POST",
                headers:{
                    "Content-Type": "application/json",
                    Authorization:`Bearer ${accessToken}`,
                },
                body:JSON.stringify(inputData)
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

    const {mutate:create, isLoading, isSuccess, error, data} = useMutation(createRequest, {
        retry:0,
        onSuccess: (data) => {
            if(data?.status === 201)
                toast.success("Закупщик успешно добавлен");
        },

    })

    return {create, isLoading, error, isSuccess, response:data}
}

export const useUpdatePurchaser = ()=>{
    const accessToken = localStorage.getItem('token');
    const updateRequest = async(input:UpdatePurchaserType):Promise<
        {
            unit?:GetPurchaserType,
            response?: FormErrors | { message: string};
            status:number
        }> =>{

        const inputData:CreatePurchaserType = {name:""}

        if(input.name && input.name !== "") inputData.name = input.name
        if(input.address && input.address !== "") inputData.address = input.address
        if(input.phone && input.phone !== "") inputData.phone = input.phone
        if(input.email && input.email !== "") inputData.email = input.email
        if(input.note && input.note !== "") inputData.note = input.note

        const response = await fetch(`${API_BASE_URL}/purchaser/${input.id}`,
            {
                method:"PATCH",
                headers:{
                    "Content-Type": "application/json",
                    Authorization:`Bearer ${accessToken}`,
                },
                body:JSON.stringify(inputData)
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

    const {mutate:update, isLoading, isSuccess, error, data} = useMutation(updateRequest, {
        retry:0,
        onSuccess: (data) => {
            if(data?.status >= 200 && data?.status < 300)
                toast.success("Закупщик успешно обновлен");
        },
    })

    return {update, isLoading, error, isSuccess, response:data}
}

export const useDeletePurchaser = ()=> {
    const accessToken = localStorage.getItem('token');

    const deleteRequest = async (id: number): Promise<
        {
            unit?:GetPurchaserType,
            response?: FormErrors | { message: string};
            status:number
        }
    > =>{


        const response = await fetch(`${API_BASE_URL}/purchaser/${id}`,{
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
    } = useMutation("DeletePurchaser", deleteRequest, {
        retry:0,
        onSuccess: (data) => {
            if(data && data.status && data?.status >= 200 && data?.status < 300) toast.success('Закупщик успешно удален');
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
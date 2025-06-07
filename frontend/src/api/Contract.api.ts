import {useMutation, useQuery} from "react-query";
import {toast} from "sonner";
import {FormErrors, handleServerError, isFormErrors, isValidJSON} from "@/lib/errors";
import {SearchParams} from "@/types";
import {CreateApplicantType, GetApplicantType, UpdateApplicantType} from "@/types/Applicant.ts";
import {CreateContractType, GetContractType, UpdateContractType} from "@/types/Contract.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const useGetContracts = (
    input: SearchParams & {type?:string, projectId:string}
) => {
    const accessToken = localStorage.getItem('token');

    const getRequest = async (): Promise<{data?: {count: number, rows: GetContractType[]}, status: number}> => {
        // Создаем объект URLSearchParams и добавляем параметры
        const params = new URLSearchParams();

        if (input.searchBy ) {
            params.append('searchBy', input.searchBy);
        }

        if (input.projectId ) {
            params.append('projectId', input.projectId);
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

        if (input.type) {
            params.append('type', input.type);
        }


        const url = `${API_BASE_URL}/contract?${params.toString()}`;

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
        ['fetchContract', input], // Ключ запроса теперь включает параметры
        getRequest,
        {retry: 1}
    );

    return {data, isLoading, error, refetch};
}


export const useGetContractDetail = (
    input: {id:string}
) => {
    const accessToken = localStorage.getItem('token');

    const getRequest = async (): Promise<{data?: GetContractType, status: number}> => {
        // Создаем объект URLSearchParams и добавляем параметры

        const url = `${API_BASE_URL}/contract/${input.id}`;

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
        ['fetchContractDetail', input], // Ключ запроса теперь включает параметры
        getRequest,
        {retry: 1}
    );

    return {data, isLoading, error, refetch};
}
export const useCreateContract = ()=>{
    const accessToken = localStorage.getItem('token');

    const createRequest = async(input:CreateContractType):Promise<
        {
            unit?:GetContractType,
            response?: FormErrors | { message: string};
            status:number
        }> =>{

        const inputData:CreateContractType = {
            name:input.name,
            type:input.type,
            projectId:input.projectId,
            applicantId:input.applicantId,
            purchaserId:input.purchaserId,
            companyId:input.companyId,
            currencyId:input.currencyId,
            amount:input.amount,
            signDate:input.signDate,
            officialBeginDate:input.officialBeginDate,
            officialFinishDate:input.officialFinishDate,
        }

        if(input.projectCurrencyExchangeRate) inputData.projectCurrencyExchangeRate = input.projectCurrencyExchangeRate
        if(input.note && input.note !== "") inputData.note = input.note


        const response = await fetch(`${API_BASE_URL}/contract`,
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
                toast.success("Контракт успешно добавлен");
        },

    })

    return {create, isLoading, error, isSuccess, response:data}
}

export const useUpdateContract = ()=>{
    const accessToken = localStorage.getItem('token');
    const updateUnitRequest = async(input:UpdateContractType):Promise<
        {
            unit?:GetContractType,
            response?: FormErrors | { message: string};
            status:number
        }> =>{

        const inputData:CreateContractType = {
            name:input.name,
            type:input.type,
            projectId:input.projectId,
            applicantId:input.applicantId,
            purchaserId:input.purchaserId,
            companyId:input.companyId,
            currencyId:input.currencyId,
            amount:input.amount,
            signDate:input.signDate,
            officialBeginDate:input.officialBeginDate,
            officialFinishDate:input.officialFinishDate,
        }

        if(input.projectCurrencyExchangeRate) inputData.projectCurrencyExchangeRate = input.projectCurrencyExchangeRate
        if(input.note && input.note !== "") inputData.note = input.note

        const response = await fetch(`${API_BASE_URL}/contract/${input.id}`,
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

    const {mutate:update, isLoading, isSuccess, error, data} = useMutation(updateUnitRequest, {
        retry:0,
        onSuccess: (data) => {
            if(data?.status >= 200 && data?.status < 300)
                toast.success("Контракт успешно обновлен");
        },
    })

    return {update, isLoading, error, isSuccess, response:data}
}

export const useUpdateContractStatus = ()=>{
    const accessToken = localStorage.getItem('token');
    const updateUnitRequest = async(input:{id:number, status:string}):Promise<
        {
            unit?:GetContractType,
            response?: FormErrors | { message: string};
            status:number
        }> =>{


        const response = await fetch(`${API_BASE_URL}/contract/status/${input.id}`,
            {
                method:"PATCH",
                headers:{
                    "Content-Type": "application/json",
                    Authorization:`Bearer ${accessToken}`,
                },
                body:JSON.stringify({status:input.status})
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
                toast.success("Контракт успешно обновлен");
        },
    })

    return {update, isLoading, error, isSuccess, response:data}
}

export const useDeleteContract = ()=> {
    const accessToken = localStorage.getItem('token');

    const deleteRequest = async (id: number): Promise<
        {
            unit?:GetContractType,
            response?: FormErrors | { message: string};
            status:number
        }
    > =>{


        const response = await fetch(`${API_BASE_URL}/contract/${id}`,{
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
    } = useMutation("DeleteContract", deleteRequest, {
        retry:0,
        onSuccess: (data) => {
            if(data && data.status && data?.status >= 200 && data?.status < 300) toast.success('Контракт успешно удален');
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
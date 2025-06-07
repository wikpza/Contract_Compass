import {useMutation, useQuery} from "react-query";
import {toast} from "sonner";
import {FormErrors, handleServerError, isFormErrors, isValidJSON} from "@/lib/errors";
import {SearchParams} from "@/types";
import {CreateApplicantType, GetApplicantType, UpdateApplicantType} from "@/types/Applicant.ts";
import {GetFileVolumeType, UpdateFileVolumeType} from "@/types/File.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const useGetFilesVolumes = (
    input: SearchParams & {contractId:number}
) => {
    const accessToken = localStorage.getItem('token');

    const getRequest = async (): Promise<{ data?: { count: number, rows: GetFileVolumeType[] }, status: number }> => {
        // Создаем объект URLSearchParams и добавляем параметры
        const params = new URLSearchParams();


        params.append('contractId', input.contractId.toString());

        if (input.searchBy) {
            params.append('searchBy', input.searchBy);
        }

        if (input.searchValue) {
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

        const url = `${API_BASE_URL}/file?${params.toString()}`;

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
        ['fetchFileVolume', input], // Ключ запроса теперь включает параметры
        getRequest,
        {retry: 1}
    );

    return {data, isLoading, error, refetch};

}


export const useAddDocument = ()=> {
    const accessToken = localStorage.getItem('token');

    const createRequest = async (input: { contractId: number, documents: File[] }): Promise<
        {
            unit?: GetFileVolumeType,
            response?: FormErrors | { message: string };
            status: number
        }> => {

        const formData = new FormData();

        input.documents.forEach((file) => {
            const utf8Name = decodeURIComponent(encodeURIComponent(file.name));
            const renamedFile = new File([file], utf8Name, { type: file.type });
            console.log(renamedFile)
            formData.append('documents', renamedFile);
        });

        formData.append('contractId', input.contractId.toString())

        const response = await fetch(`${API_BASE_URL}/file`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData
            })


        const responseData = await response.json();

        if (response && response.status && response.status >= 500 && response.status < 600) {
            toast.error(handleServerError({status: response.status}))
        }


        if (isFormErrors(responseData) && response.status >= 400 && response.status < 500) {
            return {response: responseData, status: response.status}
        }


        if (responseData && responseData.message && (response.status !== 200 && response.status !== 201)) {
            return {response: {message: responseData.message}, status: response.status};
        }


        return {unit: responseData, status: response.status};
    }

    const {mutate: create, isLoading, isSuccess, error, data} = useMutation(createRequest, {
        retry: 0,
        onSuccess: (data) => {
            if (data?.status === 201)
                toast.success("Файл успешно добавлен(ы)")
        },

    })

    return {create, isLoading, error, isSuccess, response: data}
}


export const useUpdateFileVolume = ()=>{
    const accessToken = localStorage.getItem('token');
    const updateUnitRequest = async(input:UpdateFileVolumeType):Promise<
        {
            unit?:GetFileVolumeType,
            response?: FormErrors | { message: string};
            status:number
        }> =>{




        const response = await fetch(`${API_BASE_URL}/file/${input.id}`,
            {
                method:"PATCH",
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

    const {mutate:update, isLoading, isSuccess, error, data} = useMutation(updateUnitRequest, {
        retry:0,
        onSuccess: (data) => {
            if(data?.status >= 200 && data?.status < 300)
                toast.success("Файл успешно обновлен");
        },
    })

    return {update, isLoading, error, isSuccess, response:data}
}

export const useDeleteFileVolume = ()=> {
    const accessToken = localStorage.getItem('token');

    const deleteRequest = async (id: number): Promise<
        {
            unit?: GetFileVolumeType,
            response?: FormErrors | { message: string };
            status: number
        }
    > => {


        const response = await fetch(`${API_BASE_URL}/file/${id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': "application/json",
                Authorization: `Bearer ${accessToken}`,

            }
        })

        const responseData = await response.json()

        if (response && response.status && response.status >= 500 && response.status < 600) {
            toast.error(handleServerError({status: response.status}))
        }


        if (isFormErrors(responseData) && response.status >= 400 && response.status < 500) {
            return {response: responseData, status: response.status}
        }


        if (responseData && responseData.message && (response.status !== 200 && response.status !== 201)) {
            return {response: {message: responseData.message}, status: response.status};
        }


        return {unit: responseData, status: response.status};
    }

    const {
        mutateAsync: deleteObj,
        isLoading,
        error,
        isSuccess,
        data
    } = useMutation("DeleteFileVolume", deleteRequest, {
        retry: 0,
        onSuccess: (data) => {
            if (data && data.status && data?.status >= 200 && data?.status < 300) toast.success('Файл успешно удален');
            if (data && data.status && data?.status === 409) toast.error(data.response.message);
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
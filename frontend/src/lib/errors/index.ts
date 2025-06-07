
type ErrorDetails = {
    [key: string]: string[][]
}
export type FormErrors = {
    message:string,
    details: ErrorDetails

};
export function isFormErrors(obj: unknown): obj is FormErrors {
    if (typeof obj !== 'object' || obj === null) {
        console.log('❌ Не объект или null', obj);
        return false;
    }

    if (!('message' in obj)) {
        console.log('❌ Нет message');
        return false;
    }

    if (typeof (obj as { message: unknown }).message !== 'string') {
        console.log('❌ message не строка');
        return false;
    }

    if (!('details' in obj)) {
        console.log('❌ Нет details');
        return false;
    }

    const details = (obj as { details: unknown }).details;

    if (
        typeof details !== 'object' ||
        details === null ||
        Array.isArray(details)
    ) {
        console.log('❌ details не объект или null/массив', details);
        return false;
    }

    const values = Object.values(details as Record<string, unknown>);
    const valid = values.every((value) =>
        Array.isArray(value) && value.every((item) => typeof item === 'string')
    );

    if (!valid) {
        console.log('❌ Внутри details есть не массив строк', values);
    }

    return valid;
}

export const handleServerError = (error: { status: number;}) => {
    switch (error.status) {
        case 500:
            return "Something went wrong on our side. Please try again later.";
        case 501:
            return "This functionality is not yet implemented.";
        case 502:
            return "Temporary network issue. Please try again later.";
        case 503:
            return "The server is currently unavailable. Please check back soon.";
        case 504:
            return "The server is taking too long to respond. Please try again.";
        default:
            return "An unknown error occurred. Please contact support.";
    }
};

export function isValidJSON(str: string): boolean {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}
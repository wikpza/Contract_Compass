
type ErrorDetails = {
    [key: string]: string[][]
}
export type FormErrors = {
    message:string,
    details: ErrorDetails

};
export function isFormErrors(obj: unknown): obj is FormErrors {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        'message' in obj &&
        typeof (obj as { message: unknown }).message === 'string' &&
        'details' in obj &&
        typeof (obj as { details: unknown }).details === 'object' &&
        obj.details !== null &&
        Object.keys((obj as { details: { [key: string]: string[] } }).details).every((key) => {
            const value = (obj as { details: { [key: string]: string[] } }).details[key];
            return Array.isArray(value) && value.every(item => typeof item === 'string');
        })
    );
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
import { Request, Response } from 'express';
import { ERRORS } from './authenticationErrors';
import authenticationMethods from './authenticationMethods';

interface FormattedError extends Error {
    statusCode?: number;
}

const registerUserAccount = async (request: Request, response: Response) => {
    const { email, password } = request.body;
    
    try {
        const user = await authenticationMethods.registerUserAccount(email, password);
        response.status(201).json(user);
    } catch (error) {
        if(error instanceof Error) {
            const formattedError: FormattedError = {
                name: error.name,
                message: error.message,
                statusCode: 401,
            }
            console.error(error.message);
            response.status(500).json(formattedError);
        }
    }
}

const loginUserAccount = async (request: Request, response: Response) => {
    const { email, password } = request.body;
    
    try {
        const user = await authenticationMethods.loginUserAccount(email, password);
        response.status(200).json(user);
    } catch (error) {
        if(error instanceof Error) {
            console.error(error.message);
            response.status(500).json({ error: error.message });
        }
    }
}

export default { registerUserAccount, loginUserAccount };
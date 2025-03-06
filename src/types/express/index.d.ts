export {};

// This file is used to extend the Express Request interface with custom properties.
declare global {
    namespace Express {
        interface Request {
        user?: any;
        }
    }
}
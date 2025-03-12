import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

// Mudei o (schema: z.ZodObject<any, any>) porque perdias inferencia de tipos
// e o schema.parse(req.body) poderia não retornar o tipo correto se o schema fosse mal escrito
export function validateBodyData<T extends z.ZodObject<any>>(schema: T) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue: any) => ({
                    message: `${issue.path.join(".")} is ${issue.message}`,
                }));

                res.status(400).json({
                    error: "Invalid data",
                    details: errorMessages,
                });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        }
    };
}

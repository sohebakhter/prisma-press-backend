// its a higher order function --> that returns a function(over the apis globally)
import { NextFunction, Request, RequestHandler, Response } from "express"

export const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next)
        } catch (error) {

            //
            next(error)
        }
    }
}
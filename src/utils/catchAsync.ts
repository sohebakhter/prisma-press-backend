// its a higher order function --> that returns a function(over the apis globally)

import { NextFunction, Request, RequestHandler, Response } from "express"
import httpStatus from "http-status"

export const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next)
        } catch (error) {
            console.log(error)
            res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                statusCode: httpStatus.BAD_REQUEST,
                message: "Request failed",
                error: (error as Error).message
            })
        }
    }
}
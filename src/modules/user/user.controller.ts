import httpStatus from "http-status";
import { Request, Response } from "express";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {

    //req & res এর কাজ টুকু বাদ দিয়ে বাকিটা service এর কাজ
    try {

        const payload = req.body

        const user = await userService.registerUserIntoDB(payload)

        res.status(httpStatus.CREATED).json({
            success: true,
            statusCode: httpStatus.CREATED,
            message: "User registered successfully",
            data: {
                user
            }
        })
    } catch (error) {
        console.log(error)
        res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            statusCode: httpStatus.BAD_REQUEST,
            message: "User registration failed",
            error: (error as Error).message
        })
    }
}

export const userController = {
    createUser
}
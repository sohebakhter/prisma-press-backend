import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createUser = catchAsync(async (req, res, next) => {
    //req & res এর কাজ টুকু বাদ দিয়ে বাকিটা service এর কাজ
    const payload = req.body

    const user = await userService.registerUserIntoDB(payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User registered successfully",
        data: user
    })
})

const getMyProfile = catchAsync(async (req, res, next) => {

    const userId = req.user?.id // from auth() middleware

    const profile = await userService.getMyProfileFromDB(userId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile fetched successfully",
        data: profile
    })
})

const updateMyProfile = catchAsync(async (req, res, next) => {

    const userId = req.user?.id as string
    const payload = req.body

    const updatedProfile = await userService.updateMyProfileIntoDB(userId, payload)
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User profile updated successfully",
        data: updatedProfile
    })
})

export const userController = {
    createUser,
    getMyProfile,
    updateMyProfile
}
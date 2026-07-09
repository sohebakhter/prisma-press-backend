import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { authService } from "./auth.service";
import httpStatus from "http-status";

const loginUser = catchAsync(async (req, res, next) => {
    const payload = req.body

    const { accessToken, refreshToken } = await authService.loginUser(payload)

    //under the controller we just can access the response ---> so that responded tokens can be stored in cookies
    res.cookie("accessToken", accessToken, {
        httpOnly: true, sameSite: "none", secure: false, maxAge: 1000 * 60 * 60 * 24 // 24 hours or 1 day
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, sameSite: "none", secure: false, maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days or 1 week
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged in successfully",
        data: { accessToken, refreshToken }

    })
})

const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const refreshToken = req.cookies.refreshToken

    const { accessToken } = await authService.refreshToken(refreshToken)

    res.cookie("accessToken", accessToken, {
        httpOnly: true, sameSite: "none", secure: false, maxAge: 1000 * 60 * 60 * 24 // 24 hours or 1 day
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Token refreshed successfully",
        data: { accessToken }

    })

})
export const authController = {
    loginUser,
    refreshToken
}
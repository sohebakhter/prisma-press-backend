import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { subscriptionService } from "./subscription.service";
import httpStatus from "http-status";

const createCheckoutSession = catchAsync(async (req, res, next) => {
    const userId = req.user?.id
    const result = await subscriptionService.createCheckoutSession(userId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Checkout session created successfully",
        data: result
    })
})

// const handleStripeWebhook = catchAsync(async (req, res, next) => {
//     const event = req.body as Buffer
//     const signature = req.headers["stripe-signature"] as string
//     const result = await subscriptionService.handleStripeWebhook(event, signature)

//     sendResponse(res, {
//         success: true,
//         statusCode: httpStatus.OK,
//         message: "Checkout session created successfully",
//         data: result
//     })
// })
const handleStripeWebhook = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const event = req.body as Buffer;
        const signature = req.headers['stripe-signature']!;

        await subscriptionService.handleStripeWebhook(event, signature as string)

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Webhook triggered successfully",
            data: null
        })
    }
)

const getSubscriptionStatus = (catchAsync(async (req, res, next) => {
    const userId = req.user?.id
    const result = await subscriptionService.getSubscriptionStatus(userId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Subscription status retrieved successfully",
        data: result
    })
}))

export const subscriptionController = {
    createCheckoutSession,
    handleStripeWebhook,
    getSubscriptionStatus
}
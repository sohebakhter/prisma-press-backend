import { prisma } from "../lib/prisma"
import { catchAsync } from "../utils/catchAsync"

export const subscriptionGuard = () => {
    return catchAsync(async (req, res, next) => {
        const userId = req.user?.id

        const subscription = await prisma.subscription.findUnique({
            where: {
                userId
            }
        })

        if (!subscription) {
            throw new Error("You are not subscribed to any plan")
        }

        if (subscription.status !== "ACTIVE") {
            throw new Error("Please subscribe again to a plan to access this route")
        }

        next()
    })
}
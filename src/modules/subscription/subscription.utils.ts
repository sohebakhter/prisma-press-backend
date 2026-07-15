import Stripe from "stripe"
import { stripe } from "../../lib/stripe"
import { prisma } from "../../lib/prisma"
import { SubscriptionStatus } from "../../../generated/prisma/enums"

const getPeriodEnd = (payload: Stripe.Subscription) => {

    const currentPeriodEndInMs = payload.items.data[0]?.current_period_end!
    const currentPeriodEnd = new Date(currentPeriodEndInMs * 1000)

    return currentPeriodEnd
}

export const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {
    const userId = session?.metadata?.userId
    const stripeCustomerId = session?.customer as string
    const stripeSubscriptionId = session?.subscription as string

    if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
        throw new Error("Webhook failed: Missing required data")
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId as string)

    const currentPeriodEnd = getPeriodEnd(stripeSubscription)
    await prisma.subscription.upsert({
        where: {
            userId
        },
        create: {
            userId,
            stripeCustomerId,
            stripeSubscriptionId,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodEnd
        },
        update: {
            stripeCustomerId,
            stripeSubscriptionId,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodEnd
        }

    })
}

export const handleChangeSubscription = async (payload: Stripe.Subscription) => {
    const stripeSubscriptionId = payload.id

    const status = (payload.status === "active" || payload.status === "trialing") ? SubscriptionStatus.ACTIVE : payload.status === "canceled" ? SubscriptionStatus.CANCELLED : SubscriptionStatus.EXPIRED

    const currentPeriodEnd = getPeriodEnd(payload)

    const isSubscriptionExists = await prisma.subscription.findUnique({
        where: {
            stripeSubscriptionId
        }
    })

    if (!isSubscriptionExists) {
        console.log(`Webhook: No subscription found for subscription id : ${stripeSubscriptionId}`)
        return
    }

    await prisma.subscription.update({
        where: {
            stripeSubscriptionId
        },
        data: {
            status,
            currentPeriodEnd
        }
    })

}
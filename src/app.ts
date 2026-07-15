import express, { Application, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser"
import cors from "cors"
import config from "./config";
import { userRouter } from "./modules/user/user.route";
import { authRouter } from "./modules/authentication/auth.route";
import { postRouter } from "./modules/post/post.route";
import { commentRouter } from "./modules/comment/comment.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { subscriptionRouter } from "./modules/subscription/subscription.route";
import { stripe } from "./lib/stripe";
import { premiumRouter } from "./modules/premium/premium.route";


const app: Application = express();

app.use(cors({
    origin: config.app_url,
    credentials: true
}))

//stripe webhook
app.use("/api/subscription/webhook", express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!")
})

app.use("/api/users", userRouter)
app.use("/api/auth", authRouter)
app.use("/api/posts", postRouter)
app.use("/api/comments", commentRouter)
app.use("/api/subscription", subscriptionRouter)
app.use("/api/premium", premiumRouter)

app.use(notFound)

app.use(globalErrorHandler)

export default app
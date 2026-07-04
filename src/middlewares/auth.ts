import { JwtPayload } from "jsonwebtoken"
import { Role } from "../../generated/prisma/enums"
import config from "../config"
import { catchAsync } from "../utils/catchAsync"
import { jwtUtils } from "../utils/jwt"
import { prisma } from "../lib/prisma"
import httpStatus from "http-status"

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string
                name: string
                email: string
                role: Role
            }
        }
    }
}

export const auth = (...requiredRoles: Role[]) => {
    //this rest parameter will be an array of roles, ---> dynamically pass roles whose routes can be accessed
    return catchAsync(async (req, res, next) => {
        const token = req.cookies.accessToken ?
            req.cookies.accessToken
            : req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : req.headers.authorization

        if (!token) {
            throw new Error("You are not logged in!")
        }

        const verifiedToken = jwtUtils.verifyToken(token, config.jwt_secret)

        if (!verifiedToken.success) {
            throw new Error(verifiedToken.error)
        }

        const { id, name, email, role } = verifiedToken.data as JwtPayload

        if (requiredRoles.length && !requiredRoles.includes(role)) {
            return res.status(httpStatus.FORBIDDEN).json({
                success: false,
                statusCode: httpStatus.FORBIDDEN,
                message: "You are not allowed to access this route",
            })
        }

        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id,
                email, name, role
            }
        })

        if (!user) {
            throw new Error("User not found, please login again!")
        }

        if (user.activeStatus === "BLOCKED") {
            throw new Error("You are blocked, please contact admin!")
        }

        req.user = {
            id,
            name,
            email,
            role
        }

        next()
    })
}
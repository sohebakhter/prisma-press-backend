import bcrypt from "bcryptjs"
import { prisma } from "../../lib/prisma"
import { ILoginUserPayload } from "./auth.interface"
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"
import config from "../../config"
import { jwtUtils } from "../../utils/jwt"

const loginUser = async (payload: ILoginUserPayload) => {

    const { email, password } = payload
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email
        }
    })

    if (user.activeStatus === "BLOCKED") {
        throw new Error("You are blocked, please contact admin!")
    }

    const isPasswordMatched = await bcrypt.compare(password, user?.password)

    if (!isPasswordMatched) {
        throw new Error("Password is incorrect!")
    }

    const jwtPayload = {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role
    }

    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_secret, config.expires_in as SignOptions)
    const refreshToken = jwtUtils.createToken(jwtPayload, config.jwt_refresh_secret, config.refresh_expires_in as SignOptions)

    return { accessToken, refreshToken }

}

const refreshToken = async (refreshToken: string) => {

    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_refresh_secret)

    if (!verifiedRefreshToken.success) {
        throw new Error("Token verification failed!")
    }

    const { id } = verifiedRefreshToken.data as JwtPayload

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id
        }
    })

    if (!user) {
        throw new Error("User not found!")
    }

    if (user.activeStatus === "BLOCKED") {
        throw new Error("You are blocked, please contact admin!")
    }

    const jwtPayload = {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role
    }

    const accessToken = jwtUtils.createToken(jwtPayload, config.jwt_secret, config.expires_in as SignOptions)

    return { accessToken }

}

export const authService = {
    loginUser,
    refreshToken
}
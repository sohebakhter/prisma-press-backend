import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { premiumController } from "./premium.controller";
import { subscriptionGuard } from "../../middlewares/subscriptionGuard";

const router = Router()

router.get("/",
    auth(Role.USER, Role.ADMIN, Role.AUTHOR),
    subscriptionGuard(),
    premiumController.getPremiumContent)

export const premiumRouter = router
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { premiumService } from "./premium.service";
import httpStatus from "http-status";

const getPremiumContent = catchAsync(async (req, res, next) => {
    const query = req.query
    const result = await premiumService.getPremiumContent(query)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Premium content retrieved successfully",
        data: result.data,
        meta: result.meta
    })
})

export const premiumController = {
    getPremiumContent
}
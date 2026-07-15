import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { commentService } from "./comment.service";
import httpStatus from "http-status";


const createComment = (catchAsync(async (req, res, next) => {

    const authorId = req.user?.id
    const payload = req.body

    const result = await commentService.createComment(authorId as string, payload)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Comment created successfully",
        data: result
    })

}))

const getCommentByAuthorId = (catchAsync(async (req, res, next) => {

    const authorId = req.user?.id

    const result = await commentService.getCommentByAuthorId(authorId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Comment retrieved successfully",
        data: result
    })

}))

const getCommentByPostId = (catchAsync(async (req, res, next) => {

    const { postId, } = req.params

    const result = await commentService.getCommentByPostId(postId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Comment retrieved successfully",
        data: result
    })

}))

const updateComment = (catchAsync(async (req, res, next) => {

    const { commentId } = req.params
    const payload = req.body
    const authorId = req.user?.id

    const result = await commentService.updateComment(commentId as string, payload, authorId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Comment updated successfully",
        data: result
    })

}))

const deleteComment = (catchAsync(async (req, res, next) => {

    const { commentId } = req.params
    const authorId = req.user?.id

    const result = await commentService.deleteComment(commentId as string, authorId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Comment deleted successfully",
        data: result
    })
}))

const moderateComment = (catchAsync(async (req, res, next) => {

    const { commentId } = req.params
    // const authorId = req.user?.id

    const result = await commentService.moderateComment(commentId as string, req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Comment moderated successfully",
        data: result
    })

}))

export const commentController = {
    createComment,
    getCommentByAuthorId,
    getCommentByPostId,
    updateComment,
    deleteComment,
    moderateComment
}
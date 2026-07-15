import { catchAsync } from "../../utils/catchAsync";
import { postService } from "./post.service";
import httpStatus from "http-status";
import { sendResponse } from "../../utils/sendResponse";


const createPost = catchAsync(async (req, res, next) => {
    const userId = req.user?.id
    const payload = req.body


    const post = await postService.createPost(payload, userId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Post created successfully",
        data: post
    })
})

const getAllPosts = catchAsync(async (req, res, next) => {
    const query = req.query
    // console.log("query", query)
    const posts = await postService.getAllPosts(query)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Posts retrieved successfully",
        data: posts.data,
        meta: posts.meta
    })
})

const getPostById = catchAsync(async (req, res, next) => {
    const postId = req.params.postId
    if (!postId) {
        throw new Error("Post id is required")
    }
    const post = await postService.getPostById(postId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post retrieved successfully",
        data: post
    })
})

const getMyPosts = catchAsync(async (req, res, next) => {
    const userId = req.user?.id
    const posts = await postService.getMyPosts(userId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "My Posts retrieved successfully",
        data: posts
    })
})

const getPostStats = catchAsync(async (req, res, next) => {
    const result = await postService.getPostStats()

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post stats retrieved successfully",
        data: result
    })
})

const updatePost = catchAsync(async (req, res, next) => {

    const postId = req.params.postId

    const payload = req.body

    const authorId = req.user?.id

    const isAdmin = req.user?.role === "ADMIN"

    const post = await postService.updatePost(postId as string, payload, authorId as string, isAdmin)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post updated successfully",
        data: post
    })

})

const deletePost = catchAsync(async (req, res, next) => {

    const postId = req.params.postId

    const authorId = req.user?.id

    const isAdmin = req.user?.role === "ADMIN"

    await postService.deletePost(postId as string, authorId as string, isAdmin)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Post deleted successfully",
        data: null
    })

})

export const postController = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    getMyPosts,
    getPostStats
}
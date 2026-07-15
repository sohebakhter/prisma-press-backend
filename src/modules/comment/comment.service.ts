import { prisma } from "../../lib/prisma"
import { ICreateCommentPayload, IModerateCommentPayload, IUpdateCommentPayload } from "./comment.interface"

const createComment = async (authorId: string, payload: ICreateCommentPayload) => {
    await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    })

    const comment = await prisma.comment.create({
        data: {
            ...payload,
            authorId
        }
    })

    return comment
}

const getCommentByAuthorId = (authorId: string) => {

    const comment = prisma.comment.findMany({
        where: {
            authorId
        }, orderBy: {
            createdAt: "desc"
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true
                }
            }
        }
    })

    return comment
}

const getCommentByPostId = async (postId: string) => {
    const comment = await prisma.comment.findMany({
        where: {
            postId
        },
        orderBy: {
            createdAt: "desc"
        }

    })

    return comment
}

const updateComment = async (commentId: string, data: IUpdateCommentPayload, authorId: string) => {
    const commentData = await prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId,
            authorId
        }
    })

    if (!commentData) {
        throw new Error("You are not authorized to update this comment")
    }

    const comment = await prisma.comment.update({
        where: {
            id: commentId,
            authorId
        },
        data
    })

    return comment
}

const deleteComment = (commentId: string, authorId: string) => {
    const commentData = prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId,
            authorId
        }
    })
    if (!commentData) {
        throw new Error("You are not authorized to delete this comment")
    }
    const comment = prisma.comment.delete({
        where: {
            id: commentId,
            authorId
        }
    })
    return comment
}

const moderateComment = async (id: string, data: IModerateCommentPayload) => {
    const commentData = await prisma.comment.findUniqueOrThrow({
        where: {
            id
        },
        select: {
            id: true,
            status: true
        }
    })

    if (commentData.status === data.status) {
        throw new Error(`Your comment is already ${data.status} status`)
    }

    const comment = await prisma.comment.update({
        where: {
            id
        },
        data
    })

    return comment
}

export const commentService = {
    createComment,
    getCommentByAuthorId,
    getCommentByPostId,
    updateComment,
    deleteComment,
    moderateComment
}
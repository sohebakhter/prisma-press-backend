import { CommentStatus, PostStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"
import { ICreatePostPayload, IUpdatePostPayload } from "./post.interface"

const createPost = async (payload: ICreatePostPayload, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId
        }
    })

    return result
}

const getAllPosts = async () => {
    const result = await prisma.post.findMany({
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true
        }
    })

    return result
}

const getPostById = async (postId: string) => {

    //Transaction and rollback system in database query -->for efficiency and performance
    const transactionResult = await prisma.$transaction(
        async (tx) => {
            await tx.post.update({
                where: {
                    id: postId
                },
                data: {
                    views: {
                        increment: 1
                    }
                },

            })

            const post = await tx.post.findUniqueOrThrow({
                where: {
                    id: postId
                },
                include: {
                    author: {
                        omit: {
                            password: true
                        }
                    },
                    comments: {
                        where: {

                            status: CommentStatus.APPROVED
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    },
                    _count: {
                        select: {
                            comments: true
                        }
                    }
                }
            })

            return post
        })

    return transactionResult
}

const getMyPosts = async (userId: string) => {

    const result = await prisma.post.findMany({
        where: {
            authorId: userId
        },
        include: {
            comments: true,
            _count: {
                select: {
                    comments: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        },

    })

    return result
}

const getPostStats = async () => {
    const transactionResult = await prisma.$transaction(
        async (tx) => {
            // const totalPosts = await tx.post.count()
            // const publishedPosts = await tx.post.count({
            //     where: {
            //         status: PostStatus.PUBLISHED
            //     }
            // })
            // const draftPosts = await tx.post.count({
            //     where: {
            //         status: PostStatus.DRAFT
            //     }
            // })
            // const archivedPosts = await tx.post.count({
            //     where: {
            //         status: PostStatus.ARCHIVED
            //     }
            // })

            // const totalComments = await tx.comment.count()

            // const approvedComments = await tx.comment.count({
            //     where: {
            //         status: CommentStatus.APPROVED
            //     }
            // })

            // const rejectedComments = await tx.comment.count({
            //     where: {
            //         status: CommentStatus.REJECT
            //     }
            // })

            // //aggregation with prisma in the database server /not in backend server(js diye custom code logic and loop korle same kaj, backend server ke crush korte pare)
            // const totalPostViewsWithAggregation = await tx.post.aggregate({
            //     _sum: {
            //         views: true
            //     }
            // })
            // const totalPostViews = totalPostViewsWithAggregation._sum.views

            // return {
            //     totalPosts,
            //     publishedPosts,
            //     draftPosts,
            //     archivedPosts,
            //     totalComments,
            //     approvedComments,
            //     rejectedComments,
            //     totalPostViews
            // }

            const [totalPosts, publishedPosts, draftPosts, archivedPosts, totalComments, approvedComments, rejectedComments, totalPostViewsWithAggregation] = await Promise.all([
                await tx.post.count(),
                await tx.post.count({
                    where: {
                        status: PostStatus.PUBLISHED
                    }
                }),
                await tx.post.count({
                    where: {
                        status: PostStatus.DRAFT
                    }
                }),
                await tx.post.count({
                    where: {
                        status: PostStatus.ARCHIVED
                    }
                }),
                await tx.comment.count(),
                await tx.comment.count({
                    where: {
                        status: CommentStatus.APPROVED
                    }
                }),
                await tx.comment.count({
                    where: {
                        status: CommentStatus.REJECT
                    }
                }),
                await tx.post.aggregate({
                    _sum: {
                        views: true
                    }
                })
            ])

            return {
                totalPosts,
                publishedPosts,
                draftPosts,
                archivedPosts,
                totalComments,
                approvedComments,
                rejectedComments,
                totalPostViews: totalPostViewsWithAggregation._sum.views
            }
        }
    )

    return transactionResult
}

const updatePost = async (postId: string, payload: IUpdatePostPayload, authorId: string, isAdmin: boolean) => {

    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })

    if (!isAdmin && post.authorId !== authorId) {

        throw new Error("You are not authorized to update this post")

    }

    const result = await prisma.post.update({
        where: {
            id: postId
        },
        data: payload,
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true
        }

    })

    return result
}

const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {

    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })

    if (!isAdmin && post.authorId !== authorId) {

        throw new Error("You are not authorized to delete this post")

    }

    const result = await prisma.post.delete({
        where: {
            id: postId
        }
    })

    return result
}


export const postService = {
    createPost,
    getAllPosts,
    getPostById,
    getMyPosts,
    getPostStats,
    updatePost,
    deletePost
}
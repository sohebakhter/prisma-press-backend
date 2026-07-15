import { CommentStatus, PostStatus } from "../../../generated/prisma/enums"
import { PostWhereInput } from "../../../generated/prisma/models"
import { prisma } from "../../lib/prisma"
import { ICreatePostPayload, IPostQuery, IUpdatePostPayload } from "./post.interface"

const createPost = async (payload: ICreatePostPayload, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId
        }
    })

    return result
}



const getAllPosts = async (query: IPostQuery) => {
    const limit = query.limit ? parseInt(query.limit) : 10
    const page = query.page ? parseInt(query.page) : 1
    const skip = (page - 1) * limit

    const sortBy = query.sortBy || "createdAt"
    const sortOrder = query.sortOrder || "desc"

    const tags = query.tags ? JSON.parse(query.tags as string) : ""
    const tagsArray = Array.isArray(tags) ? tags : [tags]

    //dynamic ([optimized] with array push method) filtering, searching
    const andConditions: PostWhereInput[] = []
    if (query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                },
                {
                    content: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                }
            ]
        })
    }
    if (query.title) {
        andConditions.push({
            title: query.title
        })
    }
    if (query.content) {
        andConditions.push({
            content: query.content
        })
    }
    if (query.authorId) {
        andConditions.push({
            authorId: query.authorId
        })
    }
    if (query.isFeatured) {
        andConditions.push({
            isFeatured: query.isFeatured
        })
    }
    if (query.status) {
        andConditions.push({
            status: query.status
        })
    }
    if (query.tags) {
        andConditions.push({
            tags: {
                hasSome: tagsArray
            }
        })
    }

    andConditions.push({
        isPremium: false
    })

    const posts = await prisma.post.findMany({
        // Filtering or Exact Matching of data ----><
        // 1. Exact Matching (Approach - 1)
        // where: {
        //     title: "Post Number 3",
        //     content: "Neymar"
        // },
        // 2. Exact Matching (Approach - 2)
        // where: {
        //     AND: [
        //         {
        //             title: "Post Number 3"
        //         },
        //         {
        //             content: "Neymar"
        //         },
        //         {
        //             tags: {
        //                 has: "Backend"
        //             }
        //         }
        //     ]
        // },

        //Searching or Partial Matching of data ----><
        // 1. Partial Matching (Approach - 1)
        // where: {
        //     title: {
        //         contains: "ronaldo",
        //         mode: "insensitive"
        //     }
        // },
        // 2. Partial Matching (Approach - 2)
        // where: {
        //     OR: [
        //         {
        //             title: {
        //                 contains: "RonaLdo",
        //                 mode: "insensitive"
        //             }
        //         },
        //         {
        //             content: {
        //                 contains: "ronaldo",
        //                 mode: "insensitive"
        //             }
        //         }
        //     ]
        // },

        //Combining Searching and Filtering (Partial Matching and Exact Matching) ----><
        // where: {
        //     AND: [
        //         {
        //             //searching
        //             OR: [
        //                 {
        //                     title: {
        //                         contains: "ronal",
        //                         mode: "insensitive"
        //                     }
        //                 },
        //                 {
        //                     content: {
        //                         contains: "Messi",
        //                         mode: "insensitive"
        //                     }
        //                 }
        //             ]
        //         },
        //         //filtering
        //         {
        //             title: "Ronaldo Nazario"
        //         },
        //         {
        //             content: "ronaldo"
        //         }
        //     ]
        // },


        //analog searching and filtering ----><        
        // where: {
        //     AND: [
        //         query.searchTerm ? {
        //             OR: [
        //                 {
        //                     title: {
        //                         contains: query.searchTerm,
        //                         mode: "insensitive"
        //                     }
        //                 },
        //                 {
        //                     content: {
        //                         contains: query.searchTerm,
        //                         mode: "insensitive"
        //                     }
        //                 }
        //             ]
        //         } : {},


        //         //title filtering
        //         query.title ? { title: query.title } : {},

        //         // content filtering
        //         query.content ? { content: query.content } : {}
        //     ]
        // },

        // dynamic searching, filtering --->
        where: {
            AND: andConditions
        },

        //dynamic pagination part
        take: limit,
        skip: skip,

        orderBy: {
            // sortBy : sortOrder
            [sortBy]: sortOrder
        },

        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true
        }
    })

    return {
        data: posts,
        meta: {
            page,
            limit,
            total: posts.length,
            totalPages: Math.ceil(posts.length / limit)
        }

    }
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
                    id: postId,
                    isPremium: false

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
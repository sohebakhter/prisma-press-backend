import { PostWhereInput } from "../../../generated/prisma/models"
import { prisma } from "../../lib/prisma"
import { IPostQuery } from "../post/post.interface"

const getPremiumContent = async (query: IPostQuery) => {
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
        isPremium: true
    })
    const premiumPosts = await prisma.post.findMany({
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
        data: premiumPosts,
        meta: {
            page: page,
            limit: limit,
            total: premiumPosts?.length,
            totalPage: Math.ceil(premiumPosts?.length / limit)

        }
    }
}

export const premiumService = {
    getPremiumContent
}
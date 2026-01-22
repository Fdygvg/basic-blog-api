import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/server/db'
import { redisClient, connectRedis } from '@/lib/redis'
import { apiRateLimiter } from '@/server/middleware/rateLimiter'

connectRedis()

type PostResponse = {
    id: string
    title: string
    content: string
    authorId: string
    createdAt: Date
    author: {
        id: string
        email: string
        name: string | null
    }
}

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PostResponse[] | { error: string }>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const cacheKey = 'posts:recent'
    const cachedPosts = await redisClient.get(cacheKey)
    if (cachedPosts) {
        console.log('Posts found in cache')
        return res.status(200).json(JSON.parse(cachedPosts))
    }


    try {
        const posts = await db.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 5
        })
        await redisClient.setEx(cacheKey, 120, JSON.stringify(posts))
        console.log('Fetching Posts From Database')
        return res.status(200).json(posts)
    } catch (error) {
        console.error('Get posts error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default apiRateLimiter(handler)
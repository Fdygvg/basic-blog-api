import { createClient } from "redis"
import { db } from "@/server/db"

const redisClient = createClient()
redisClient.on('error', err => console.log('Redis Client Error', err))




export async function prewarmCache() {
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
    await redisClient.setEx('posts:recent', 120, JSON.stringify(posts))
    console.log('Cache warmed up successfully')
}

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect()
        try {
            await prewarmCache()
        } catch (error) {
            console.log('Prewarm failed, but Redis connected')
        }
    }
}


export { redisClient, connectRedis }
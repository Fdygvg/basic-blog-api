import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/server/db'

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<PostResponse[] | { error: string }>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
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
            }
        })

        return res.status(200).json(posts)
    } catch (error) {
        console.error('Get posts error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}
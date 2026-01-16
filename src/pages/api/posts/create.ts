import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/server/db'
import { protect } from '@/server/middleware/auth'

type CreatePostRequest = {
    title: string
    content: string
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { title, content }: CreatePostRequest = req.body
        const user = (req as any).user // From protect middleware

        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' })
        }

        const post = await db.post.create({
            data: {
                title,
                content,
                authorId: user.id
            }
        })

        return res.status(201).json(post)
    } catch (error) {
        console.error('Create post error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default protect(handler)
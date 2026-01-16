import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/server/db'
import { protect } from '@/server/middleware/auth'

type CreateCommentRequest = {
    text: string
    postId: string
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { text, postId }: CreateCommentRequest = req.body
        const user = (req as any).user

        if (!text || !postId) {
            return res.status(400).json({ error: 'Text and postId are required' })
        }

        // Verify post exists
        const post = await db.post.findUnique({
            where: { id: postId }
        })

        if (!post) {
            return res.status(404).json({ error: 'Post not found' })
        }

        const comment = await db.comment.create({
            data: {
                text,
                postId,
                authorId: user.id
            },
            include: {
                author: {
                    select: { id: true, email: true, name: true }
                }
            }
        })

        return res.status(201).json(comment)
    } catch (error) {
        console.error('Create comment error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default protect(handler)
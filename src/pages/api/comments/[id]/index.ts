import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/server/db'
import { protect } from '@/server/middleware/auth'

type Params = {
    id: string
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { id } = req.query as Params
        const user = (req as any).user

        const comment = await db.comment.findUnique({
            where: { id }
        })

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' })
        }

        // Check ownership
        if (comment.authorId !== user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' })
        }

        await db.comment.delete({
            where: { id }
        })

        return res.status(200).json({ message: 'Comment deleted successfully' })
    } catch (error) {
        console.error('Delete comment error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default protect(handler)

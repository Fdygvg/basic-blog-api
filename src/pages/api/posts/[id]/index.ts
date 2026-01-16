import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/server/db'
import { protect } from '@/server/middleware/auth'

type Params = {
  id: string
}

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
  comments?: Array<{
    id: string
    text: string
    authorId: string
    createdAt: Date
    author: {
      id: string
      email: string
      name: string | null
    }
  }>
}


const getHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | { error: string }>
) => {
  try {
    const { id } = req.query as Params

    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, email: true, name: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, email: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    return res.status(200).json(post)
  } catch (error) {
    console.error('Get post error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

const deleteHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id } = req.query as Params
    const user = (req as any).user

    // Find the post
    const post = await db.post.findUnique({
      where: { id }
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    // Check if user owns the post
    if (post.authorId !== user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this post' })
    }

    // Delete the post (comments cascade automatically if schema has onDelete: Cascade)
    await db.post.delete({
      where: { id }
    })

    return res.status(200).json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Delete post error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      return getHandler(req, res)
    case 'DELETE':
      return protect(deleteHandler)(req, res)
    default:
      return res.status(405).json({ error: 'Method not allowed' })
  }
}
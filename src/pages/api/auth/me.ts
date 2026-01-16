// src/pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { db } from '../../../server/db'

const JWT_SECRET = process.env.JWT_SECRET!

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, createdAt: true }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json(user)
  } catch (error) {
    console.error(error)
    return res.status(401).json({ error: 'Invalid token' })
  }
}
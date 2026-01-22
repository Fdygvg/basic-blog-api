// src/pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { db } from '../../../server/db'
import { redisClient, connectRedis } from '../../../lib/redis'
import { authRateLimiter } from '@/server/middleware/rateLimiter'

connectRedis()

const JWT_SECRET = process.env.JWT_SECRET!
const EXP = 3600
async function handler(
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
    if (!decoded.userId) {
      return res.status(404).json({ error: 'User not found' })
    }

    const cacheKey = `user:${decoded.userId}`
    const cachedUser = await redisClient.get(cacheKey)
    if (cachedUser) {
      console.log('User found in cache')
      return res.status(200).json(JSON.parse(cachedUser))
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, createdAt: true }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await redisClient.setEx(cacheKey, EXP, JSON.stringify(user))
    console.log('User not found in cache, fetching from database')

    return res.status(200).json(user)
  } catch (error) {
    console.error(error)
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export default authRateLimiter(handler)
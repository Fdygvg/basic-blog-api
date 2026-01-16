import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { db } from '../db'

const JWT_SECRET = process.env.JWT_SECRET!

export const protect = (handler: Function) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '')

            if (!token) {
                return res.status(401).json({ error: 'Not authorized, no token' })
            }

            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

            const user = await db.user.findUnique({
                where: { id: decoded.userId }
            })

            if (!user) {
                return res.status(401).json({ error: 'User not found' })
            }

            // Attach user to request object
            ; (req as any).user = user

            return handler(req, res)
        } catch (error) {
            return res.status(401).json({ error: 'Not authorized, token failed' })
        }
    }
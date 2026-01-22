import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/server/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { LoginRequest, LoginResponse } from '../../../types'
import { authRateLimiter } from '@/server/middleware/rateLimiter'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<LoginResponse | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { email, password }: LoginRequest = req.body

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }


        // Find user
        const user = await db.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Check password
        const passwordValid = await bcrypt.compare(password, user.password)
        if (!passwordValid) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        // Return user and token
        const response: LoginResponse = {
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            },
            token
        }

        return res.status(200).json(response)
    } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default authRateLimiter(handler)
import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/server/db'
import bcrypt from 'bcryptjs'
import type { SignupRequest, SignupResponse } from '@/types/index'
import { authRateLimiter } from '@/server/middleware/rateLimiter'

async function handler(
    req: NextApiRequest,
    res: NextApiResponse<SignupResponse | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { email, password, name }: SignupRequest = req.body

        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null
            }
        })

        // Return user (excluding password)
        const userResponse: SignupResponse = {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
        }

        return res.status(201).json(userResponse)
    } catch (error) {
        console.error('Signup error:', error)
        return res.status(500).json({ error: 'Internal server error' })
    }
}

export default authRateLimiter(handler)
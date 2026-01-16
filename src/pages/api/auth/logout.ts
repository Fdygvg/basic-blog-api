import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<{ message: string } | { error: string }>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    // For JWT tokens, client-side just discards the token
    // For server-side sessions, you would invalidate the token here
    // Since you're using JWT stored client-side, logout is client-side responsibility

    return res.status(200).json({ message: 'Logged out successfully' })
}
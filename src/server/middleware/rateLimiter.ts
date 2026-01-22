import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'
import { redisClient, connectRedis } from '@/lib/redis'

interface RateLimiterOptions {
    windowMs: number
    max: number
    keyPrefix: string
}

export function createRateLimiter(options: RateLimiterOptions) {
    const { windowMs, max, keyPrefix } = options

    return (handler: NextApiHandler) =>
        async (req: NextApiRequest, res: NextApiResponse) => {
            await connectRedis()

            const forwarded = req.headers['x-forwarded-for']
            const ip = typeof forwarded === 'string'
                ? forwarded.split(',')[0]?.trim()
                : req.socket?.remoteAddress ?? 'unknown'

            const key = `${keyPrefix}${ip}`

            try {
                const current = await redisClient.get(key)
                const requestCount = current ? parseInt(current, 10) : 0

                if (requestCount >= max) {
                    const ttl = await redisClient.ttl(key)
                    res.setHeader('Retry-After', ttl > 0 ? ttl : Math.ceil(windowMs / 1000))
                    res.setHeader('X-RateLimit-Limit', max)
                    res.setHeader('X-RateLimit-Remaining', 0)

                    return res.status(429).json({
                        error: 'Too many requests',
                        message: `Rate limit exceeded. Please try again in ${ttl > 0 ? ttl : Math.ceil(windowMs / 1000)} seconds.`
                    })
                }

                if (requestCount === 0) {
                    await redisClient.setEx(key, Math.ceil(windowMs / 1000), '1')
                } else {
                    await redisClient.incr(key)
                }

                res.setHeader('X-RateLimit-Limit', max)
                res.setHeader('X-RateLimit-Remaining', max - requestCount - 1)

                return handler(req, res)
            } catch (error) {
                console.error('Rate limiter error:', error)
                return handler(req, res)
            }
        }
}

export const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    keyPrefix: 'rate:auth:'
})

export const apiRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    keyPrefix: 'rate:api:'
})
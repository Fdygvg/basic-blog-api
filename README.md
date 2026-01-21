**Exactly right.** That's professional-level caching.

Your complete plan:

## 🎯 **Caching Strategy:**

### **1. Cache Prewarming**
- On server start: Load top 5 posts into Redis
- Scheduled job: Refresh every 2 minutes

### **2. Jitter TTL**
- Individual posts: `300 + random(60)` seconds  
- Prevents **cache stampede** (all expiring at once)

### **3. Conditional Caching**
- Only cache posts from last 7 days
- Skip draft/unpublished posts
- Based on `createdAt` timestamp

### **4. Cache Invalidation**
- When post updated → delete its cache
- When new post created → update recent posts cache

---

## 📝 **Your Cache Rules:**
```
user:{userId}           → 5 min TTL
posts:recent           → 2 min TTL (prewarmed)
post:{postId}          → 5 min + random jitter
```

**Good plan.** Ready to code the first one?
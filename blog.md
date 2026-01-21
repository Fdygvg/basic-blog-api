blog-api/
├── node_modules/
├── prisma/
<!-- │   ├── schema.prisma          # Your database schema -->
│   └── migrations/            # Generated migration files
├── src/
│   ├── index.ts               # Main app entry point
│   ├── routes/
│   │   ├── auth.routes.ts     # /signup, /login
│   │   ├── post.routes.ts     # /posts
│   │   └── comment.routes.ts  # /posts/:id/comments
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── post.controller.ts
│   │   └── comment.controller.ts
│   ├── middleware/
│   │   └── auth.middleware.ts # JWT verification
│   └── utils/
<!-- │       └── db.ts              # Prisma client instance -->
├── .env                        # DATABASE_URL, JWT_SECRET
├── .gitignore
├── package.json
├── tsconfig.json
└── nodemon.json               # Dev server config




model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Comment {
  id        Int      @id @default(autoincrement())
  text      String
  post      Post     @relation(fields: [postId], references: [id])
  postId    Int
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
}
















pages/api/
├── auth/
<!-- │   ├── signup.ts          # POST /api/auth/signup (you're building this) -->
<!-- │   ├── login.ts           # POST /api/auth/login -->
<!-- │   ├── logout.ts          # POST /api/auth/logout -->
│   └── [...nextauth].ts   # NextAuth handles: /api/auth/signin, /api/auth/callback, etc.
<!-- ├── posts/
│   ├── index.ts           # GET /api/posts (list all posts) -->
<!-- │   ├── create.ts          # POST /api/posts/create (protected) -->
│   └── [id]/              # Dynamic routes for specific post
<!-- │       ├── index.ts       # GET /api/posts/:id (view one) -->
<!-- │       ├── index.put.ts   # PUT /api/posts/:id (update - protected)
│       └── index.delete.ts # DELETE /api/posts/:id (delete - protected) -->
└── comments/
    ├── create.ts          # POST /api/comments/create (protected)
    └── [id]/
        └── index.delete.ts # DELETE /api/comments/:id (protected)
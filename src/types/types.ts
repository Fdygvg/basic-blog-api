export type SignupRequest = {
    email: string;
    password: string;
    name?: string;
};

export type SignupResponse = {
    id: string;
    email: string;
    name?: string | null;
    createdAt: Date;
};

export type CommentCreateInput = {
    text: string;
    postId: string;
    authorId: string;
};

export type CommentResponse = {
    id: string;
    text: string;
    postId: string;
    authorId: string;
    createdAt: Date;
};

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    user: Omit<SignupResponse, 'createdAt'>;
    token: string;
};
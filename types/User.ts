export type User = {
    id: string;
    email: string;
    name: string;
    surname: string;
    nickname: string;
    password: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export type Token = {
    id: string;
    iat: number;
}

export type ShortenedUser = {
    id: string;
    nickname: string;
}
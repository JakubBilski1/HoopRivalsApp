import { ShortenedUser } from "./User";

export type Friendship = {
    friend: ShortenedUser
    status: string
}

export type Friendships = {
    friends: Friendship[]
    requests: Friendship[]
}
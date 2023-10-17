export interface UserSubscription {
    pseudo : string,
    password : string,
    email : string,
    avatar : string,
}

export interface UserLogin {
    email : string,
    password : string,
}

export enum Role {
    ADMIN = 'admin',
    USER = 'user'
}

export interface UserSubscription {
    pseudo : string,
    password : string,
    email : string,
    createdAt : string,
    avatar : string,
    role : Role
}

export enum Role {
    ADMIN = 'admin',
    USER = 'user'
}

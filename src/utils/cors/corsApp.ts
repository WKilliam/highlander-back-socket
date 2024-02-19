import cors from 'cors';

export const corsApp = {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type, Authorization"],
    credentials: true
}

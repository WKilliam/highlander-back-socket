import cors from 'cors';

export const corsApp = {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type, Authorization"],
    credentials: true
}

import cors from 'cors';

export const corsApp = {
    origin: "http://195.154.114.37:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type, Authorization"],
    credentials: true
}

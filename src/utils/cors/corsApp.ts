
import cors from 'cors';

export const corsApp = {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type, Authorization"],
        credentials: true
    }
}

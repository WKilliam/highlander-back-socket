import express, {Express} from 'express';
import {corsApp} from "./utils/cors/corsApp";
import {swaggerDocument} from "./utils/swagger/swagger";
import swaggerUi from "swagger-ui-express";
const port: number = 3000;
const app = express();
import cors from 'cors';
app.use(express.json());
const httpServer: Express = require('http').createServer(app);
const io = require('socket.io')(httpServer, corsApp);
app.use('/docs', swaggerUi.serve, swaggerDocument);
require("./controller/socket/socketsController")(io)
app.use(cors(corsApp))
app.use(express.json())

// io.on('connection', (socket: { on: (arg0: string, arg1: (message: string) => void) => void; id: string; }) => {
//     console.log('a user connected');
//
//     socket.on('message', (message) => {
//         console.log(message);
//         io.emit('message', `${socket.id.substr(0, 2)} said ${message}`);
//     });
//
//     socket.on('disconnect', () => {
//         console.log('a user disconnected!');
//     });
// });

httpServer.listen(port, () => console.log(`listening on port ${port}`));

module.exports.ioobject = io;

import express, {Express} from 'express';
import {corsApp} from "./utils/cors/corsApp";
import {swaggerDocument} from "./utils/swagger/swagger";
import swaggerUi from "swagger-ui-express";
const port: number = 3000;
const app = express();
import MapController from "./controller/maps/map.controller";
import SessionController from "./controller/session/session.controller";
import CardsController from "./controller/cards/cards.controller";
import EffectsController from "./controller/effects/effects.controller";
import EventsController from "./controller/events/events.controller";
import DecksController from "./controller/decks/decks.controller";
import UsersController from "./controller/users/users.controller";
import cors from "cors";
import JsonController from "./controller/json/json";
app.use(express.json());
app.use(cors(corsApp));
const httpServer: Express = require('http').createServer(app);
const io = require('socket.io')(httpServer, corsApp);
app.use('/docs', swaggerUi.serve, swaggerDocument);
require("./controller/socket/socketsController")(io)
app.use(express.json())


app.use('/maps', MapController);
app.use('/sessions', SessionController);
app.use('/cards',CardsController);
app.use('/effects',EffectsController);
app.use('/events',EventsController);
app.use('/decks',DecksController);
app.use('/user',UsersController);
app.use('/json',JsonController)
// module.exports.ioobject = io;


io.on('connection', (socket) => {


    socket.on('join-room', (room:string) => {
        socket.join(room);
        console.log(`Le socket a rejoint la salle : ${room}`);
    });

    socket.on('leave-room', (room: any) => {
        if (socket.rooms.has(room)) {
            socket.leave(room);
            console.log(`Le socket a quitté la salle : ${room}`);
        } else {
            console.log(`Le socket n'était pas dans la salle : ${room}`);
        }
    });

    socket.on('send-message-by-room', (data : {message:string,room:string}) => {
        const room = data.room;
        const message = data.message;
        io.to(room).emit(`receive-highlander-socket-${room}`, message);
    });

    io.socketsLeave("room1");

    socket.on('disconnect', () => {
        console.log('Connexion socket fermée');
    });
});




httpServer.listen(port, () => console.log(`listening on port ${port}`));

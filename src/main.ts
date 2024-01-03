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
import CapacityController from "./controller/capacity/capacity.controller";
import SocketController from "./controller/socket/socket.controller.rest";
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
app.use('/capacity',CapacityController);
app.use('/user',UsersController);
app.use('/socket',SocketController);

httpServer.listen(port, () => console.log(`listening on port ${port}`));

module.exports.ioobject = io;

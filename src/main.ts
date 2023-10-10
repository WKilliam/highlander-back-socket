import express, {Express} from 'express';
import {corsApp} from "./utils/cors/corsApp";
import {swaggerDocument} from "./utils/swagger/swagger";
import swaggerUi from "swagger-ui-express";
const port: number = 3000;
const app = express();
import cors from 'cors';
import MapController from "./controller/maps/map.controller";
import SessionController from "./controller/session/session.controller";
import CardsController from "./controller/cards/cards.controller";
import EffectsController from "./controller/effects/effects.controller";
app.use(express.json());
const httpServer: Express = require('http').createServer(app);
const io = require('socket.io')(httpServer, corsApp);
app.use('/docs', swaggerUi.serve, swaggerDocument);
require("./controller/socket/socketsController")(io)
app.use(express.json())

app.use('/maps', MapController);
app.use('/sessions', SessionController);
app.use('/cards',CardsController);
app.use('/effects',EffectsController);

httpServer.listen(port, () => console.log(`listening on port ${port}`));

module.exports.ioobject = io;

import {SocketService} from "../../services/socket/socket.service";
import {debug} from "util";
import {Socket} from "net";

module.exports = (io) => {
    const socketService = new SocketService();

    const socketEndPoints: string = 'highlander-socket'

    io.on('connect', (socket) => {
        console.log('Nouvelle connexion socket établie');



    });
}

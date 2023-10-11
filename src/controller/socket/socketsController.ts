import {SocketService} from "../../services/socket/socket.service";
import {AppDataSource} from "../../utils/database/database.config";

module.exports = (io:any) => {
    const socketService = new SocketService(AppDataSource);

    io.on('connection', (socket:any) => {

        io.on('join_session', (message:string) => {
            io.join(message)
        })

        io.on('select_team', (message:string) => {

        })
    })
}

import { Server, Socket } from "socket.io";
import { Client } from "socket.io/dist/client";

export class Main {
    
    readonly PORT = 5000;
    readonly DATA_CHANNEL = "sync";

    private server: Server;
    private clients: Socket[] = []

    constructor() {
        const self = this;

        this.server = new Server(this.PORT);

        this.server.on("connection", (socket) => {
            console.log(`Client connected [id=${socket.id}]`)
            this.clients.push(socket);

            socket.on(this.DATA_CHANNEL, ( msg: string ) => {
                console.log(`Received message [id=${socket.id}, message=${msg}]`);
                this.broadcast(this.DATA_CHANNEL, msg, socket);
            })

            // Disconnect event to remove the client
            socket.on("disconnect", () => {
                self.clients.splice(this.clients.indexOf(socket), 1);
                console.log(`Client disconnected [id=${socket.id}]`)
            });
        });
    }

    broadcast(channel: string, message: string, blacklist: Socket) {
        this.clients.forEach( ( client ) => {
            if (client != blacklist) {
                client.emit(channel, message);
            }
        })
    }

}

new Main();
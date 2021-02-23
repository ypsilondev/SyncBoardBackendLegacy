import { Server, Socket } from "socket.io";

export class Main {
    
    readonly PORT = 5000;
    readonly DATA_CHANNEL = "sync";

    private server: Server;
    private clients: Socket[] = []

    constructor() {
        const self = this;

        this.server = new Server(this.PORT);

        this.server.on("connection", (socket) => {
            console.info(`Client connected [id=${socket.id}]`)
            this.clients.push(socket);

            socket.on(this.DATA_CHANNEL, ( msg: string ) => {
                console.info(`Received message [id=${socket.id}, message=${msg}]`);
                this.broadcast(this.DATA_CHANNEL, msg);
            })

            // Disconnect event to remove the client
            socket.on("disconnect", () => {
                self.clients.splice(this.clients.indexOf(socket), 1);
                console.info(`Client disconnected [id=${socket.id}]`)
            });
        });
    }

    broadcast(channel: string, message: string) {
        this.clients.forEach( ( client ) => {
            client.emit(channel, message);
        })
    }

}

new Main();
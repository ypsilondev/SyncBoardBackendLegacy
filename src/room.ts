import { Socket } from "socket.io";
import { Utility } from "./util";

export class Room {

    readonly DATA_CHANNEL = "sync";
    private readonly token: string;
    private clients: Socket[] = [];

    constructor(socket: Socket) { 
        this.token = Utility.getRandomString(4);
        this.initializeSocket(socket);
    }

    /**
     * Add a new client to the socket.
     * 
     * @param socket the socket
     */
    public addClient(socket: Socket) {
        this.initializeSocket(socket);
    }

    /**
     * Get the token from the channel.
     */
    public getToken(): string {
        return this.token;
    }

    private initializeSocket(socket: Socket) {
        this.clients.push(socket);
        socket.on(this.DATA_CHANNEL, this.onDataChannelMessage);
    }

    private onDataChannelMessage(client: Socket, message: string) {
        this.broadcast(client, message);
    }

    public removeClient(client: Socket) {
        if (this.clients.includes(client)) {
            client.off(this.DATA_CHANNEL, this.onDataChannelMessage);   // remove the listener
            this.clients.splice(this.clients.indexOf(client), 1);
        }
    }

    private broadcast(source: Socket, message: string) {
        this.clients.forEach(( client ) => {
            if (client != source) { // do not send back to author.
                client.emit(this.DATA_CHANNEL, message);
            }
        })
    }

} 
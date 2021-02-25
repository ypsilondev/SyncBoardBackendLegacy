import { Socket } from "socket.io";
import { Client } from "./client";
import { Main } from "./main";
import { Utility } from "./util";

export class Room {

    private readonly token: string;
    private clients: Client[] = [];

    constructor(socket: Client) { 
        this.token = Utility.getRandomString(4);
        this.initializeSocket(socket);
    }

    /**
     * Add a new client to the socket.
     * 
     * @param socket the socket
     */
    public addClient(socket: Client) {
        this.initializeSocket(socket);
    }

    /**
     * Get the token from the channel.
     */
    public getToken(): string {
        return this.token;
    }

    private initializeSocket(client: Client) {
        client.setRoom(this);
        this.clients.push(client);
    }

    

    public removeClient(client: Client) {
        if (this.clients.includes(client)) {
            this.clients.splice(this.clients.indexOf(client), 1);
            client.setRoom(undefined);
        }
    }

    public broadcast(source: Client, message: string) {
        this.clients.forEach(( client ) => {
            if (client != source) { // do not send back to author.
                client.getSocket().emit(Main.DATA_CHANNEL, message);
            }
        })
    }

} 
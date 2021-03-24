import { Client } from "./client";
import { Main } from "./main";
import { Utility } from "./util";

export class Room {

    private readonly token: string;
    private clients: Client[] = [];

    // Syncronization
    private syncInProgress = false;
    private syncingClients: Client[] = [];

    constructor(socket: Client) { 
        this.token = Utility.getRandomString(4);
        this.initializeSocket(socket);
    }

    /**
     * Add a new client to the socket.
     * 
     * @param client the socket
     */
    public addClient(client: Client) {
        this.initializeSocket(client);
        this.initializeBroadcast(client);
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

    private initializeBroadcast(destination: Client) {
        this.syncingClients.push(destination);
        if (!this.syncInProgress) {
            this.syncInProgress = true;
            this.clients[0].initializeBroadcast();
        }
    }
    
    public syncronizeClients(data: string) {
        // send message to the sync waiting clients
        this.clients.forEach(( client ) => {
            client.emit(Main.DATA_CHANNEL, data);
        })

        // reset the sync variables
        this.syncInProgress = false;
        this.clients = [];
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
import { Client } from "./client";
import { Main } from "./main";
import { Utility } from "./util";

export class Room {

    private static readonly JOIN_MESSAGE = {action: "joined"};
    private static readonly LEAVE_MESSAGE = {action: "left"};

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
     * Add a new client to the socket and send the join message to other clients.
     * 
     * @param client the socket
     */
    public addClient(client: Client) {
        this.initializeSocket(client);
        this.startUpSync(client);

        this.broadcast(client, Room.JOIN_MESSAGE, Main.COMMAND_CHANNEL);
    }

    /**
     * Get the token from the channel.
     */
    public getToken(): string {
        return this.token;
    }

    /**
     * Initialize the socket for further usage. set the current room and add the client to the room.
     * 
     * @param client the client to initialize
     */
    private initializeSocket(client: Client) {
        client.setRoom(this);
        this.clients.push(client);
    }

    /**
     * initiaze a broadcast (fetching from the current room state).
     * 
     * @param destination the client that needs the broadcast
     */
    private startUpSync(destination: Client) {
        this.syncingClients.push(destination);
        if (!this.syncInProgress) {
            this.syncInProgress = true;
            this.clients[0].emit(Main.COMMAND_CHANNEL, {action: "sendBoard"});
        }
    }
    
    /**
     * Method to sync redirect the response from sync request to the requesting clients.
     * 
     * @param data the data to redirect.
     */
    public syncronizeClients(data: string) {
        // send message to the sync waiting clients
        this.syncingClients.forEach(( client ) => {
            client.emit(Main.DATA_CHANNEL, data);
        })

        // reset the sync variables
        this.syncInProgress = false;
        this.syncingClients = [];
    }

    /**
     * Remove a client from the room and reset there room.
     * 
     * @param client the client to remove from the room
     */
    public removeClient(client: Client) {
        if (this.clients.includes(client)) {
            this.clients.splice(this.clients.indexOf(client), 1);
            client.setRoom(undefined);

            this.broadcast(client, Room.LEAVE_MESSAGE, Main.COMMAND_CHANNEL);
        }
    }

    /**
     * Broadcast a message across the entire room.
     * 
     * @param source the source client that sends the message (can be null)
     * @param message the message to broadcast
     * @param channel the channel to send the message to
     */
    public broadcast(source: Client, message: any, channel: string) {
        this.clients.forEach(( client ) => {
            if (client != source) { // do not send back to author.
                client.getSocket().emit(channel, message);
            }
        })
    }

} 
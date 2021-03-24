import { Server, Socket } from "socket.io";
import { Client } from "./client";
import { Room } from "./room";

export class Main {
    
    readonly PORT = 5000;
    public static readonly COMMAND_CHANNEL = "cmd";
    public static readonly DATA_CHANNEL = "sync";
    public static readonly SYNCRONIZE_CHANNEL = "init-sync";

    private server: Server;
    private clients: Client[] = [];
    private rooms: Room[] = [];

    constructor() {
        this.server = new Server(this.PORT);

        this.server.on("connection", (socket) => {
            console.log(`Client connected [id=${socket.id}, ip=${socket.handshake.address}]`)
            const client = new Client(socket);
            this.clients.push(client);

            socket.on(Main.COMMAND_CHANNEL, ( msg: string ) => {
                const request: {action: string, payload: any|undefined} = JSON.parse(msg);

                switch (request.action) {
                    case "join": {
                        const room = this.getRoom(request.payload as string);
                        if (room == undefined) {
                            socket.emit(Main.COMMAND_CHANNEL, {error: 'token invalid', success: false});
                        } else {
                            this.removeClientFromRooms(client);
                            room.addClient(client);
                            socket.emit(Main.COMMAND_CHANNEL, {success: true});
                        }
                        break;
                    }
                    case "create": {
                        const room = this.createRoom(client);
                        this.rooms.push(room);
                        socket.emit(Main.COMMAND_CHANNEL, {token: room.getToken()});
                    }
                }
            })

            // Disconnect event to remove the client
            socket.on("disconnect", () => {
                this.removeClient(socket);
                console.log(`Client disconnected [id=${socket.id}]`)
            });
        });
    }

    getRoom(token: string) : Room|undefined {
        let channel: Room|undefined = undefined;
        
        this.rooms.forEach(( room ) => {
            if (room.getToken() == token) {
                channel = room;
            }
        })

        return channel;
    }

    removeClientFromRooms(client: Client) {
        this.rooms.forEach(( room ) => {
            room.removeClient(client);
        })
    }

    removeClient(client: Client) {
        this.clients.splice(this.clients.indexOf(client), 1);
        this.removeClientFromRooms(client);
    }

    createRoom(client: Client): Room {
        return new Room(client);
    }

    broadcast(channel: string, message: string, blacklist: Client) {
        this.clients.forEach( ( client ) => {
            if (client != blacklist) {
                client.getSocket().emit(channel, message);
            }
        })
    }

}

new Main();
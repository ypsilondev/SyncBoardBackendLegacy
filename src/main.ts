import { Server, Socket } from "socket.io";
import { Client } from "./client";
import { Room } from "./room";
import { Request } from "./structs/requests.struct";

export class Main {
    
    private static readonly PORT = 5000;

    public static readonly COMMAND_CHANNEL = "cmd";
    public static readonly DATA_CHANNEL = "sync";
    public static readonly SYNCRONIZE_CHANNEL = "init-sync";
    public static readonly ERASE_CHANNEL = "erase";

    public static readonly BROADCAST_CHANNELS = [Main.DATA_CHANNEL, Main.ERASE_CHANNEL];

    private server: Server;
    private clients: Client[] = [];
    private rooms: Room[] = [];

    constructor() {
        this.server = new Server(Main.PORT);

        this.server.on("connection", (socket) => {
            console.log(`Client connected [id=${socket.id}, ip=${socket.handshake.address}]`);
            const client = new Client(socket);
            this.clients.push(client);

            socket.on(Main.COMMAND_CHANNEL, ( message: string ) => {
                const request: Request = JSON.parse(message);

                switch (request.action) {
                    case "join": {
                        this.handleJoin(request, client);
                        break;
                    }
                    case "create": {
                        this.handleCreate(request, client);
                        break;
                    }
                }
            })

            // Disconnect event to remove the client
            socket.on("disconnect", () => {
                this.removeClient(socket);
                console.log(`Client disconnected [id=${socket.id}]`);
            });
        });
    }

    private handleCreate(request: Request, client: Client) {
        const room = this.createRoom(client);
        this.rooms.push(room);
        client.emit(Main.COMMAND_CHANNEL, {token: room.getToken()});
    }

    private handleJoin(request: Request, client: Client) {
        const room = this.getRoom(request.payload as string);

        if (room == undefined) {
            client.emit(Main.COMMAND_CHANNEL, {error: 'token invalid', success: false});
        } else {
            this.removeClientFromRooms(client);
            room.addClient(client);
            client.emit(Main.COMMAND_CHANNEL, {success: true});
        }
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
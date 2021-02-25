import { Server, Socket } from "socket.io";
import { Room } from "./room";

export class Main {
    
    readonly PORT = 5000;
    readonly COMMAND_CHANNEL = "cmd";

    private server: Server;
    private clients: Socket[] = [];
    private rooms: Room[] = [];

    constructor() {
        this.server = new Server(this.PORT);

        this.server.on("connection", (client) => {
            console.log(`Client connected [id=${client.id}, ip=${client.handshake.address}]`)
            this.clients.push(client);

            client.on(this.COMMAND_CHANNEL, ( msg: string ) => {
                const request: {action: string, payload: any|undefined} = JSON.parse(msg);

                switch (request.action) {
                    case "join": {
                        const room = this.getRoom(request.payload as string);
                        if (room == undefined) {
                            const data = JSON.stringify({'error': 'token invalid'});
                            client.emit(this.COMMAND_CHANNEL, data);
                        } else {
                            room.addClient(client);
                            const data = JSON.stringify({'success': 'joined room'});
                            client.emit(this.COMMAND_CHANNEL, data);
                        }
                        break;
                    }
                    case "create": {
                        const token = this.createRoom(client);
                        const data = JSON.stringify({token: token});
                        client.emit(this.COMMAND_CHANNEL, data);
                    }
                }
            })

            // Disconnect event to remove the client
            client.on("disconnect", () => {
                this.removeClient(client);
                console.log(`Client disconnected [id=${client.id}]`)
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

    removeClient(client: Socket) {
        this.clients.splice(this.clients.indexOf(client), 1);
        this.rooms.forEach(( room ) => {
            room.removeClient(client);
        })
    }

    createRoom(client: Socket): Room {
        return new Room(client);
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
import { Socket } from "socket.io";
import { Main } from "./main";
import { Room } from "./room";

export class Client {

    private readonly client: Socket;
    private room: Room|undefined;
    private self: Client;

    constructor(client: Socket) {
        this.client = client;
        this.self = this;
    }

    public setRoom(room: Room|undefined) {
        if (room != undefined) {
            this.room = room;
            this.client.on(Main.DATA_CHANNEL, ( message ) => {
                this.onDataChannelMessage(message);
            });
        } else {
            this.room = undefined;
        }
    }

    public getSocket() : Socket {
        return this.client;
    }

    public getRoom() : Room|undefined {
        return this.room;
    }

    private onDataChannelMessage(message: string) {
        if (this.room != undefined) {
            this.room.broadcast(this, message);
        }
    }

}
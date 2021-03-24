import { Socket } from "socket.io";
import { Main } from "./main";
import { Room } from "./room";

export class Client {

    private readonly socket: Socket;
    private room: Room|undefined;

    constructor(socket: Socket) {
        this.socket = socket;
    }

    public setRoom(room: Room|undefined) {
        if (room != undefined) {
            this.room = room;
            this.socket.on(Main.DATA_CHANNEL, ( message ) => {
                this.onDataChannelMessage(message);
            });
        } else {
            this.room = undefined;
        }
    }

    public emit(room: string, message: string) {
        this.socket.emit(room, message);
    }

    public initializeBroadcast() {
        this.socket.on(Main.SYNCRONIZE_CHANNEL, ( message ) => {
            this.room?.syncronizeClients(message);
        });
        this.socket.emit(Main.COMMAND_CHANNEL, {action: "sendBoard"});
    }

    public getSocket() : Socket {
        return this.socket;
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
import { Socket } from "socket.io";
import { Main } from "./main";
import { Room } from "./room";

export class Client {

    private readonly socket: Socket;
    private room: Room|undefined;

    constructor(socket: Socket) {
        this.socket = socket;
        this.initSocket();
    }

    private initSocket() {
        Main.BROADCAST_CHANNELS.forEach(channel => {
            this.socket.on(channel, ( message ) => {
                this.onBroadcastChannelMessage(channel, message);
            });
        });

        this.socket.on(Main.SYNCRONIZE_CHANNEL, ( message ) => {
            this.onInitialSync(message);
        });
    }

    public setRoom(room: Room|undefined) {
        if (room != undefined) {
            this.room = room;
        } else {
            this.room = undefined;
        }
    }

    public emit(room: string, message: any) {
        this.socket.emit(room, message);
    }

    public getSocket() : Socket {
        return this.socket;
    }

    public getRoom() : Room|undefined {
        return this.room;
    }

    private onInitialSync(message: string) {
        this.room?.syncronizeClients(message);
    }

    private onBroadcastChannelMessage(channel: string, message: string) {
        if (this.room != undefined) {
            this.room.broadcast(this, message, channel);
        }
    }

}
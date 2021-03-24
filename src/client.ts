import { Socket } from "socket.io";
import { Main } from "./main";
import { Room } from "./room";

export class Client {

    private static count = 0;

    private readonly socket: Socket;
    private room: Room|undefined;

    constructor(socket: Socket) {
        this.socket = socket;
        this.initSocket();
    }

    private initSocket() {
        this.socket.on(Main.DATA_CHANNEL, ( message ) => {
            this.onDataChannelMessage(message);
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

    public emit(room: string, message: string) {
        this.socket.emit(room, message);
    }

    public initializeBroadcast() {
        this.socket.emit(Main.COMMAND_CHANNEL, {action: "sendBoard"});
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

    private onDataChannelMessage(message: string) {
        console.log(Client.count++);
        if (this.room != undefined) {
            this.room.broadcast(this, message);
        }
    }

}
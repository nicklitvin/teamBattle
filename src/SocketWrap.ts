import { Socket } from "socket.io";

export default class SocketWrap {
    public id : string;
    public emit : Function;
    public socket : Socket;
    public savedMessages : string[][] = [];

    constructor(socket? : Socket) {
        if (socket) {
            this.id = socket.id;
            this.emit = socket.emit;
            this.socket = socket;
        } else {
            this.emit = (...args) => {
                let message : string[] = [];
                for (let word of args) {
                    message.push(word);
                }
                this.savedMessages.push(message);
            }
        }
    }
}
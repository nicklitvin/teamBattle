import { Socket } from "socket.io";

export default class SocketWrap {
    public id : string;
    public emit : Function;
    public savedMessages : string[][] = [];

    constructor(socket? : Socket) {
        if (socket) {
            this.id = socket.id;
            this.emit = socket.emit;
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

    public clearSavedMessages() {
        this.savedMessages = [];
    }
}
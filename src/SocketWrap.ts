import { Socket } from "socket.io";

/**
 * A SocketWrap mimicks a Socket's variables/methods.
 * 
 * If a socket is given upon initialization, the class
 * behaves exactly like a Socket. 
 * 
 * Else, any call to a socket's variables/methods will
 * return what has been customly set. Emit messages are
 * stored. This is used for testing purposes.
 */
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
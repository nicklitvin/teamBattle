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

    public socket : Socket;

    constructor(socket? : Socket) {
        if (socket) {
            this.socket = socket;
            this.id = this.socket.id;
            this.emit = (event : string, ...args : string[]) => {
                this.socket.emit(event,args);
            }
        } else {
            this.emit = (...args : any[]) => {
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
import { Socket } from "socket.io";

/**
 * A SocketWrap mimicks a Socket's variables/methods.
 * 
 * If a socket is given upon initialization, the class
 * behaves exactly like a Socket. 
 * 
 * Else, any call to a socket's variables/methods will
 * return what has been customly set. Emit messages are
 * stored under this.savedMessages in the form 
 * [[event,...args], ...]. This is used for testing purposes.
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
            this.emit = (event : string, ...args : any) => {
                this.socket.emit(event,...args);
            }
        } else {
            this.emit = (...args : any) => {
                this.savedMessages.push(args);
            }
        }
    }

    public clearSavedMessages() {
        this.savedMessages = [];
    }
}
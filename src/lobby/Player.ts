import { Socket } from "socket.io";

export default class Player {
    public lobbyId: string;
    public socket : Socket;
    public online = true;
    public returning = false;

    constructor(lobbyId: string, socket : Socket) {
        this.lobbyId = lobbyId;
        this.socket = socket;
    }
}
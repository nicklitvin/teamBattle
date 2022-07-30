import { Socket } from "socket.io";

export default class Player {
    public lobbyId: string;
    public socket : Socket;
    public online = true;

    constructor(lobbyId: string, socket : Socket) {
        this.lobbyId = lobbyId;
        this.socket = socket;
    }
}
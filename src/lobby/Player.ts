import SocketWrap from "../socketWrap";

export default class Player {
    public lobbyId: string;
    public socketWrap : SocketWrap;
    public online = true;
    public returning = false;

    constructor(lobbyId: string, socketWrap : SocketWrap) {
        this.lobbyId = lobbyId;
        this.socketWrap = socketWrap;
    }
}
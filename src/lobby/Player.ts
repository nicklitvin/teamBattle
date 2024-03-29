import SocketWrap from "../SocketWrap";

/**
 * Player class is used to keep track of clients who want to receive
 * updates regarding their lobby and for when they transition between
 * lobby and game.
 */
export default class Player {
    public readonly id : string;
    public readonly lobbyId : string;
    public socketWrap : SocketWrap;

    /** online = is player still on website */
    public online = true;
    
    /** Returning = whether player is returning to lobby from game */
    public returning = false;

    constructor(id : string, lobbyId: string, socketWrap : SocketWrap) {
        this.id = id;
        this.lobbyId = lobbyId;
        this.socketWrap = socketWrap;
    }
}
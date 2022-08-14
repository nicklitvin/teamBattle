/**
 * A lobby contains a list of the players inside, its status,
 * and other information specific to it.
 */
export default class Lobby {
    public _id : string;
    public _redirectToLobby : string;
    public _redirectToGame : string;
    public _players : Set<String> = new Set();
    public _leader : string;
    public _countText : string;
    
    /** when true, game is running and players are not deleted
     *  when disconnecting unless all are offline.
     */
    public _inGame = false;
    
    /** when true, players are not deleted when disconnecting */
    public _transition = false;

    constructor(id : string) {
        this._id = id;
        this._redirectToLobby = `lobby?r=${id}`;
        this._redirectToGame = `game?r=${id}`;
    }

    /**
     * Adds player's id to lobby's player list. If there are no
     * other players, player is assigned the leader role.
     * @param id 
     */
    public addPlayer(id : string) {
        if (this.getPlayerCount() == 0) {
            this._leader = id;
        }
        this._players.add(id);
        this.updateCountText();
    }

    /**
     * Remove's players id from list and assigns a different
     * player to be the leader if the room is not empty.
     * @param id 
     */
    public removePlayer(id : string) {
        this._players.delete(id);
        if (this._leader == id && this.getPlayerCount() > 0) {
            let players = this._players.values();
            this._leader = players.next().value;
        }
        this.updateCountText();
    }

    public getPlayerCount() {
        return this._players.size;
    }

    public updateCountText() {
        this._countText = `Players in lobby: ${this.getPlayerCount()}`;
    }

    public startTransitionPhase() {
        this._transition = true;
    }

    public endTransitionPhase() {
        this._transition = false;
    }

    public switchToInGameStatus() {
        this._inGame = true;
    }

    public switchBackFromInGameStatus() {
        this._inGame = false;
    }

    public getPlayerList() : string[] {
        let list : string[] = [];
        this._players.forEach((id) => list.push(String(id)));
        return list;
    }
}
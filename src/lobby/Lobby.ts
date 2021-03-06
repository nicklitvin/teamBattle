import LobbyData from "./LobbyData"

export default class Lobby {
    private _data = new LobbyData();

    constructor(id) {
        this._data.id = id;
        this._data.redirectToLobby = `lobby?r=${id}`;
        this._data.redirectToGame = `game?r=${id}`;
    }

    public getData() : LobbyData { 
        return this._data;
    }

    public addPlayer(id : string) {
        if (this.getPlayerCount() == 0) {
            this._data.leader = id;
        }
        this._data.players.add(id);
        this.updateCountText();
    }

    public removePlayer(id : string) {
        this._data.players.delete(id);
        if (this._data.leader == id && this.getPlayerCount() > 0) {
            let players = this._data.players.values();
            this._data.leader = players.next().value;
        }
        this.updateCountText();
    }

    public getPlayerCount() {
        return this._data.players.size;
    }

    public updateCountText() {
        this._data.countText = `Players in lobby: ${this.getPlayerCount()}`;
    }

    public switchToInGameStatus() {
        this._data.inGame = true;
        this._data.transition = true;
    }

    public endTransitionPhase() {
        this._data.transition = false;
    }

    public switchBackFromInGameStatus() {
        this._data.inGame = false;
    }
}
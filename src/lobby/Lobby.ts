import LobbyData from "./LobbyData"

export default class Lobby {
    private _data = new LobbyData();

    constructor(id) {
        this._data.id = id;
        this._data.redirect = `lobby?r=${id}`;
    }

    public getData() : LobbyData { 
        return this._data;
    }

    public addPlayer(id : string) {
        if (this.getPlayerCount() == 0) {
            this._data.captain = id;
        }
        this._data.players.add(id);
        this.updateCountText();
    }

    public removePlayer(id : string) {
        this._data.players.delete(id);
        if (this._data.captain == id && this.getPlayerCount() > 0) {
            let players = this._data.players.values();
            this._data.captain = players.next().value;
        }
        this.updateCountText();
    }

    public getPlayerCount() {
        return this._data.players.size;
    }

    public updateCountText() {
        this._data.countText = `Players in lobby: ${this.getPlayerCount()}`;
    }
}
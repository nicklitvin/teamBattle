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
        this._data.players.add(id);
    }

    public removePlayer(id : string) {
        this._data.players.delete(id);
    }

    public getPlayerCount() {
        return this._data.players.size;
    }
}
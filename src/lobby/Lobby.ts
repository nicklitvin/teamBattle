import LobbyData from "./LobbyData"

export default class Lobby {
    private _data = new LobbyData();

    constructor(id) {
        this._data.id = id;
        this._data.redirect = `lobby?r=${id}`
    }

    public getData() : LobbyData { 
        return this._data;
    }
}
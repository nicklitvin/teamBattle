"use strict";
exports.__esModule = true;
var LobbyManagerData_1 = require("./LobbyManagerData");
var object_hash_1 = require("object-hash");
var Lobby_1 = require("./Lobby");
var LobbyManager = (function () {
    function LobbyManager(io) {
        this._data = new LobbyManagerData_1["default"]();
        this.setupIoCommunication(io);
    }
    LobbyManager.prototype.setupIoCommunication = function (io) {
        var _this = this;
        io.on("connection", function (socket) {
            socket.on("createLobby", function () {
                _this.addPlayer(socket);
                var lobby = _this.createLobby(socket.id);
                _this.sendPlayerToLobby(socket, lobby);
            });
        });
    };
    LobbyManager.prototype.createLobby = function (socketId) {
        var id = this.createId(socketId);
        var lobby = new Lobby_1["default"](id);
        this._data.lobbys[id] = lobby;
        return lobby;
    };
    LobbyManager.prototype.addPlayer = function (socket) {
        this._data.players[socket.id] = socket;
    };
    LobbyManager.prototype.sendPlayerToLobby = function (socket, lobby) {
        socket.emit("redirect", lobby.getData().redirect);
    };
    LobbyManager.prototype.createId = function (id) {
        while (true) {
            id = id.substring(0, this._data.lobbyIdLength);
            if (Object.keys(this._data.lobbys).includes(id)) {
                id = (0, object_hash_1.hash)(id);
            }
            else {
                break;
            }
        }
        return id;
    };
    LobbyManager.prototype.getData = function () {
        return this._data;
    };
    return LobbyManager;
}());
exports["default"] = LobbyManager;

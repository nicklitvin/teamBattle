"use strict";
exports.__esModule = true;
var LobbyManagerData_1 = require("./LobbyManagerData");
var hash = require("object-hash");
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
                _this.socketCreateLobby(socket);
            });
            socket.on("joinLobby", function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                try {
                    var lobbyId = args[0];
                    _this.socketJoinLobby(socket, lobbyId);
                }
                catch (_a) {
                    console.log("error join");
                }
            });
        });
    };
    LobbyManager.prototype.socketCreateLobby = function (socket) {
        var lobby = this.createLobby(socket.id);
        this.sendPlayerToLobby(socket, lobby);
        console.log("creating lobby", lobby.getData().id);
    };
    LobbyManager.prototype.createLobby = function (socketId) {
        var id = this.createId(socketId);
        var lobby = new Lobby_1["default"](id);
        this._data.lobbies[id] = lobby;
        return lobby;
    };
    LobbyManager.prototype.addPlayer = function (socket) {
        this._data.players[socket.id] = socket;
        console.log("adding player", socket.id);
    };
    LobbyManager.prototype.sendPlayerToLobby = function (socket, lobby) {
        socket.emit("redirect", lobby.getData().redirect);
    };
    LobbyManager.prototype.createId = function (id) {
        while (true) {
            id = id.substring(0, this._data.lobbyIdLength);
            if (Object.keys(this._data.lobbies).includes(id)) {
                id = hash.sha1(id);
            }
            else {
                break;
            }
        }
        console.log("created id", id);
        return id;
    };
    LobbyManager.prototype.getData = function () {
        return this._data;
    };
    LobbyManager.prototype.sendPlayerId = function (socket, playerId) {
        socket.emit("setId", playerId);
    };
    LobbyManager.prototype.socketJoinLobby = function (socket, lobbyId) {
        if (Object.keys(this._data.lobbies).includes(lobbyId)) {
            this.addPlayer(socket);
            this.sendPlayerId(socket, socket.id);
            var lobby = this._data.lobbies[lobbyId];
            lobby.addPlayer(socket.id);
            console.log("player joined", socket.id);
        }
        else {
            console.log("cant join room", lobbyId);
        }
    };
    return LobbyManager;
}());
exports["default"] = LobbyManager;

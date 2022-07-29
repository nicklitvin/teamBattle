"use strict";
exports.__esModule = true;
var LobbyManagerData_1 = require("./LobbyManagerData");
var hash = require("object-hash");
var Lobby_1 = require("./Lobby");
var SocketMessages = require("../client/socketMessages.json");
var Player_1 = require("./Player");
var LobbyManager = (function () {
    function LobbyManager(io) {
        this._data = new LobbyManagerData_1["default"]();
        this.setupIoCommunication(io);
    }
    LobbyManager.prototype.setupIoCommunication = function (io) {
        var _this = this;
        io.on("connection", function (socket) {
            socket.on(SocketMessages.disconnect, function () {
                _this.socketRemovePlayer(socket);
            });
            socket.on(SocketMessages.createLobby, function () {
                _this.socketCreateLobby(socket);
            });
            socket.on(SocketMessages.joinLobby, function () {
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
    LobbyManager.prototype.sendPlayerToLobby = function (socket, lobby) {
        socket.emit(SocketMessages.redirect, lobby.getData().redirect);
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
        socket.emit(SocketMessages.setId, playerId);
    };
    LobbyManager.prototype.socketJoinLobby = function (socket, lobbyId) {
        if (this._data.lobbies[lobbyId]) {
            this.sendPlayerId(socket, socket.id);
            this._data.sockets[socket.id] = socket.id;
            this._data.players[socket.id] = new Player_1["default"](lobbyId, socket);
            var lobby = this._data.lobbies[lobbyId];
            lobby.addPlayer(socket.id);
            console.log("player joined", socket.id);
        }
        else {
            console.log("cant join room", lobbyId);
        }
    };
    LobbyManager.prototype.socketRemovePlayer = function (socket) {
        if (this._data.sockets[socket.id]) {
            var playerId = this._data.sockets[socket.id];
            var player = this._data.players[playerId];
            var lobby = this._data.lobbies[player.lobbyId];
            lobby.removePlayer(playerId);
            console.log(lobby.getPlayerCount());
            if (lobby.getPlayerCount() == 0) {
                console.log("deleting room", lobby.getData().id);
                delete this._data.lobbies[lobby.getData().id];
            }
            delete this._data.sockets[socket.id];
            delete this._data.players[playerId];
            console.log("removing player", this._data.players);
        }
    };
    return LobbyManager;
}());
exports["default"] = LobbyManager;

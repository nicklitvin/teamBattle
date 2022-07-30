"use strict";
exports.__esModule = true;
var LobbyManagerData_1 = require("./LobbyManagerData");
var hash = require("object-hash");
var Lobby_1 = require("./Lobby");
var SocketMessages = require("../client/socketMessages.json");
var Player_1 = require("./Player");
var LobbyManager = (function () {
    function LobbyManager(io) {
        this._data = new LobbyManagerData_1["default"](io);
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
                    var playerId = args[1];
                    _this.socketJoinLobby(socket, lobbyId, playerId);
                }
                catch (_a) {
                    console.log("error join");
                }
            });
            socket.on(SocketMessages.startGame, function () {
                try {
                    _this.socketStartGame(socket);
                }
                catch (_a) {
                    console.log("not legit start");
                }
            });
            socket.on(SocketMessages.playerIsReturning, function () {
                _this.socketReturnToLobby(socket);
                console.log("player is returning");
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
        socket.emit(SocketMessages.redirect, lobby.getData().redirectToLobby);
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
    LobbyManager.prototype.socketJoinLobby = function (socket, lobbyId, playerId) {
        var lobby = this._data.lobbies[lobbyId];
        if (playerId) {
            var player = this._data.players[playerId];
            if (player && player.lobbyId == lobbyId) {
                var lobby_1 = this._data.lobbies[lobbyId];
                if (lobby_1.getData().players.has(playerId)) {
                    player.returning = false;
                    player.socket = socket;
                    this._data.sockets[socket.id] = playerId;
                    this.sendLobbyUpdate(lobby_1);
                    console.log("player returned");
                    return;
                }
            }
        }
        if (lobby && !lobby.getData().inGame) {
            this._data.sockets[socket.id] = socket.id;
            this._data.players[socket.id] = new Player_1["default"](lobbyId, socket);
            socket.emit(SocketMessages.setId, socket.id);
            var lobby_2 = this._data.lobbies[lobbyId];
            lobby_2.addPlayer(socket.id);
            this.sendLobbyUpdate(lobby_2);
            console.log("player joined", socket.id);
        }
        else {
            socket.emit(SocketMessages.redirect, SocketMessages.errorUrlBit);
            console.log("cant join room", lobbyId);
        }
    };
    LobbyManager.prototype.socketRemovePlayer = function (socket) {
        if (this._data.sockets[socket.id]) {
            var playerId = this._data.sockets[socket.id];
            var player = this._data.players[playerId];
            var lobby = this._data.lobbies[player.lobbyId];
            if (lobby.getData().inGame) {
                player.online = false;
                return;
            }
            if (player.returning) {
                return;
            }
            lobby.removePlayer(playerId);
            if (lobby.getPlayerCount() == 0) {
                console.log("deleting room", lobby.getData().id);
                delete this._data.lobbies[lobby.getData().id];
            }
            else {
                this.sendLobbyUpdate(lobby);
            }
            delete this._data.sockets[socket.id];
            delete this._data.players[playerId];
            console.log("removing player, global players left: ", Object.keys(this._data.players).length);
        }
    };
    LobbyManager.prototype.sendLobbyUpdate = function (lobby) {
        var data = lobby.getData();
        var players = data.players.values();
        var captain = data.captain;
        var text = data.countText;
        while (true) {
            var next = players.next();
            var playerId = next.value;
            var done = next.done;
            if (done)
                break;
            var socket = this._data.players[playerId].socket;
            socket.emit(SocketMessages.countUpdate, text);
            if (playerId == captain) {
                socket.emit(SocketMessages.captainPower);
            }
        }
    };
    LobbyManager.prototype.socketStartGame = function (socket) {
        var captainId = this._data.sockets[socket.id];
        var lobbyId = this._data.players[captainId].lobbyId;
        var lobby = this._data.lobbies[lobbyId];
        if (captainId == lobby.getData().captain) {
            lobby.switchToInGameStatus();
            this._data.gameManager.startGame(lobbyId);
            var data = lobby.getData();
            var playerIds = data.players.values();
            var redirectUrl = data.redirectToGame;
            while (true) {
                var next = playerIds.next();
                var playerId = next.value;
                var done = next.done;
                if (done)
                    break;
                var player = this._data.players[playerId];
                var socket_1 = player.socket;
                socket_1.emit(SocketMessages.redirect, redirectUrl);
            }
            console.log("start game in lobby: ", lobbyId);
        }
    };
    LobbyManager.prototype.socketReturnToLobby = function (socket) {
        var playerId = this._data.sockets[socket.id];
        var player = this._data.players[playerId];
        var lobby = this._data.lobbies[player.lobbyId];
        player.returning = true;
        socket.emit(SocketMessages.redirect, lobby.getData().redirectToLobby);
    };
    return LobbyManager;
}());
exports["default"] = LobbyManager;

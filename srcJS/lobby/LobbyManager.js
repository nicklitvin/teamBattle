"use strict";
exports.__esModule = true;
var hash = require("object-hash");
var Lobby_1 = require("./Lobby");
var SocketMessages = require("../client/socketMessages.json");
var Player_1 = require("./Player");
var socketWrap_1 = require("../socketWrap");
var GameManager_1 = require("../game/GameManager");
var LobbyManager = (function () {
    function LobbyManager(io) {
        this._sockets = {};
        this._players = {};
        this._lobbies = {};
        this._lobbyIdLength = 6;
        this.setupIoCommunication(io);
        this._gameManager = new GameManager_1["default"](io, this);
    }
    LobbyManager.prototype.setupIoCommunication = function (io) {
        var _this = this;
        io.on("connection", function (socket) {
            var socketWrap = new socketWrap_1["default"](socket);
            socket.on(SocketMessages.disconnect, function () {
                _this.socketRemovePlayer(socketWrap);
            });
            socket.on(SocketMessages.createLobby, function () {
                _this.socketCreateLobby(socketWrap);
            });
            socket.on(SocketMessages.joinLobby, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                try {
                    var lobbyId = args[0];
                    var playerId = args[1];
                    _this.socketJoinLobby(socketWrap, lobbyId, playerId);
                }
                catch (_a) {
                    console.log("Lobbymanager.joinLobby error");
                }
            });
            socket.on(SocketMessages.startGame, function () {
                try {
                    _this.socketStartGame(socketWrap);
                }
                catch (_a) {
                    console.log("Lobbymanager.startGame error");
                }
            });
            socket.on(SocketMessages.playerWantsToReturn, function () {
                try {
                    _this.socketReturnToLobby(socketWrap);
                }
                catch (_a) {
                    console.log("LobbyManager.playerWantsToReturn error");
                }
            });
        });
    };
    LobbyManager.prototype.socketCreateLobby = function (socketWrap) {
        var id = this.createId(socketWrap.id);
        var lobby = new Lobby_1["default"](id);
        this._lobbies[id] = lobby;
        socketWrap.emit(SocketMessages.redirect, lobby._redirectToLobby);
        console.log("creating lobby", lobby._id);
    };
    LobbyManager.prototype.createId = function (id) {
        while (true) {
            id = id.substring(0, this._lobbyIdLength);
            if (Object.keys(this._lobbies).includes(id)) {
                id = hash.sha1(id);
            }
            else {
                break;
            }
        }
        return id;
    };
    LobbyManager.prototype.socketJoinLobby = function (socketWrap, lobbyId, playerId) {
        var lobby = this._lobbies[lobbyId];
        if (playerId) {
            var player = this._players[playerId];
            if (player && player.lobbyId == lobbyId) {
                var lobby_1 = this._lobbies[lobbyId];
                if (lobby_1._players.has(playerId)) {
                    player.returning = false;
                    player.socketWrap = socketWrap;
                    this._sockets[socketWrap.id] = playerId;
                    this.sendLobbyUpdate(lobby_1);
                    console.log("player returned");
                    return;
                }
            }
        }
        if (lobby && !lobby._inGame) {
            var newPlayer = new Player_1["default"](socketWrap.id, lobbyId, socketWrap);
            this._sockets[socketWrap.id] = newPlayer.id;
            this._players[newPlayer.id] = newPlayer;
            socketWrap.emit(SocketMessages.setId, newPlayer.id);
            var lobby_2 = this._lobbies[lobbyId];
            lobby_2.addPlayer(newPlayer.id);
            this.sendLobbyUpdate(lobby_2);
            console.log("player joined", socketWrap.id);
        }
        else {
            socketWrap.emit(SocketMessages.redirect, SocketMessages.errorUrlBit);
            console.log("cant join room", lobbyId);
        }
    };
    LobbyManager.prototype.socketRemovePlayer = function (socketWrap) {
        if (this._sockets[socketWrap.id]) {
            var playerId = this._sockets[socketWrap.id];
            var player = this._players[playerId];
            var lobby = this._lobbies[player.lobbyId];
            delete this._sockets[socketWrap.id];
            if (lobby._inGame) {
                player.online = false;
                if (lobby._transition) {
                    console.log("transition disconnect", playerId);
                }
                else {
                    console.log("disconnect during game", playerId);
                }
                return;
            }
            else if (player.returning) {
                console.log("player returning to lobby ", playerId);
                return;
            }
            delete this._players[playerId];
            console.log("removing player, global players left: ", Object.keys(this._players).length);
            lobby.removePlayer(playerId);
            if (lobby.getPlayerCount() == 0) {
                console.log("deleting room", lobby._id);
                delete this._lobbies[lobby._id];
            }
            else {
                this.sendLobbyUpdate(lobby);
            }
        }
    };
    LobbyManager.prototype.sendLobbyUpdate = function (lobby) {
        var captain = lobby._leader;
        var text = lobby._countText;
        for (var _i = 0, _a = lobby.getPlayerList(); _i < _a.length; _i++) {
            var playerId = _a[_i];
            var socketWrap = this._players[playerId].socketWrap;
            socketWrap.emit(SocketMessages.countUpdate, text);
            if (playerId == captain) {
                socketWrap.emit(SocketMessages.lobbyLeaderRole);
            }
        }
    };
    LobbyManager.prototype.socketStartGame = function (socketWrap) {
        var requesterId = this._sockets[socketWrap.id];
        var lobbyId = this._players[requesterId].lobbyId;
        var lobby = this._lobbies[lobbyId];
        if (requesterId == lobby._leader) {
            lobby.switchToInGameStatus();
            this._gameManager.startGame(lobbyId);
            for (var _i = 0, _a = lobby.getPlayerList(); _i < _a.length; _i++) {
                var playerId = _a[_i];
                var socketWrap_2 = this._players[playerId].socketWrap;
                socketWrap_2.emit(SocketMessages.redirect, lobby._redirectToGame);
            }
            console.log("start game in lobby: ", lobbyId);
        }
        else {
            console.log("false game start");
        }
    };
    LobbyManager.prototype.socketReturnToLobby = function (socketWrap) {
        var playerId = this._sockets[socketWrap.id];
        var player = this._players[playerId];
        var lobby = this._lobbies[player.lobbyId];
        if (!lobby._inGame) {
            player.returning = true;
            delete this._sockets[socketWrap.id];
            socketWrap.emit(SocketMessages.redirect, lobby._redirectToLobby);
            console.log("player is returning");
        }
        else {
            console.log("false player return");
        }
    };
    LobbyManager.prototype.clearAllData = function () {
        this._lobbies = {};
        this._players = {};
        this._sockets = {};
        this._gameManager.clearAllData();
    };
    return LobbyManager;
}());
exports["default"] = LobbyManager;

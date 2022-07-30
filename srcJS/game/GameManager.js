"use strict";
exports.__esModule = true;
var Game_1 = require("./Game");
var GameManagerData_1 = require("./GameManagerData");
var SocketMessages = require("../client/socketMessages.json");
var GameManager = (function () {
    function GameManager(io, data) {
        var _this = this;
        this._data = new GameManagerData_1["default"]();
        this._data.lobbyData = data;
        io.on("connection", function (socket) {
            socket.on(SocketMessages.disconnect, function () {
                try {
                    _this.socketLeaveGame(socket);
                }
                catch (_a) {
                }
            });
            socket.on(SocketMessages.joinGame, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                try {
                    var id = args[0];
                    var lobbyId = args[1];
                    _this.socketJoinGame(id, lobbyId, socket);
                }
                catch (_a) {
                    console.log("player cant join game");
                }
            });
        });
    }
    GameManager.prototype.startGame = function (lobbyId) {
        var _this = this;
        var game = new Game_1["default"]();
        var lobby = this._data.lobbyData.lobbies[lobbyId];
        this._data.games[lobbyId] = game;
        setTimeout(function () {
            console.log("checking if all gone");
            lobby.endTransitionPhase();
            if (_this.areAllOffline(lobby)) {
                _this.deleteLobby(lobby);
            }
            _this.endGame(lobby);
        }, this._data.transitionTime);
    };
    GameManager.prototype.socketJoinGame = function (id, lobbyId, socket) {
        if (this._data.lobbyData.lobbies[lobbyId].getData().players.has(id)) {
            this._data.lobbyData.sockets[socket.id] = id;
            var player = this._data.lobbyData.players[id];
            player.socket = socket;
            player.online = true;
            console.log("player joined game", id);
        }
    };
    GameManager.prototype.socketLeaveGame = function (socket) {
        var leaverId = this._data.lobbyData.sockets[socket.id];
        var player = this._data.lobbyData.players[leaverId];
        var lobby = this._data.lobbyData.lobbies[player.lobbyId];
        var lobbyData = lobby.getData();
        if (lobbyData.inGame) {
            player.online = false;
            if (lobbyData.transition) {
                return;
            }
            if (this.areAllOffline(lobby)) {
                this.deleteLobby(lobby);
            }
        }
    };
    GameManager.prototype.areAllOffline = function (lobby) {
        var lobbyData = lobby.getData();
        var playerIds = lobbyData.players.values();
        var allOffline = true;
        while (true) {
            var next = playerIds.next();
            var playerId = next.value;
            var done = next.done;
            if (done)
                break;
            if (this._data.lobbyData.players[playerId].online) {
                allOffline = false;
                break;
            }
        }
        return allOffline;
    };
    GameManager.prototype.deleteLobby = function (lobby) {
        var lobbyId = lobby.getData().id;
        var playerIds = lobby.getData().players.values();
        while (true) {
            var next = playerIds.next();
            var playerId = next.value;
            var done = next.done;
            if (done)
                break;
            var player = this._data.lobbyData.players[playerId];
            delete this._data.lobbyData.sockets[player.socket.id];
            delete this._data.lobbyData.players[playerId];
        }
        delete this._data.lobbyData.lobbies[lobbyId];
        delete this._data.games[lobbyId];
        console.log("deleting lobby");
    };
    GameManager.prototype.endGame = function (lobby) {
        lobby.switchBackFromInGameStatus();
        var lobbyData = lobby.getData();
        var playerIds = lobbyData.players.values();
        while (true) {
            var next = playerIds.next();
            var playerId = next.value;
            var done = next.done;
            if (done)
                break;
            var player = this._data.lobbyData.players[playerId];
            if (!player.online) {
                delete this._data.lobbyData.sockets[player.socket.id];
                delete this._data.lobbyData.players[playerId];
            }
            else {
                player.socket.emit(SocketMessages.returnFromGameButton);
            }
        }
    };
    return GameManager;
}());
exports["default"] = GameManager;

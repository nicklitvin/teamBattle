"use strict";
exports.__esModule = true;
var Game_1 = require("./Game");
var SocketMessages = require("../client/socketMessages.json");
var socketWrap_1 = require("../socketWrap");
var GameManager = (function () {
    function GameManager(io, data) {
        var _this = this;
        this._games = {};
        this._transitionTime = 1000 * 3;
        this._setTimerBeforeGameStart = true;
        this._instantGameUpdates = false;
        this._immediatelyEndGame = true;
        this._lobbyManager = data;
        io.on("connection", function (socket) {
            var socketWrap = new socketWrap_1["default"](socket);
            socket.on(SocketMessages.disconnect, function () {
                try {
                    _this.socketLeaveGame(socketWrap);
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
                    _this.socketJoinGame(socketWrap, id, lobbyId);
                }
                catch (_a) {
                    console.log("GameManager.joinGame error");
                }
            });
            socket.on(SocketMessages.gameInput, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                try {
                    _this.socketProcessGameInput(socketWrap, args);
                }
                catch (_a) {
                    console.log("GameManager.processinput error");
                }
            });
        });
    }
    GameManager.prototype.startGame = function (lobbyId) {
        var _this = this;
        var game = new Game_1["default"]();
        var lobby = this._lobbyManager._lobbies[lobbyId];
        this._games[lobbyId] = game;
        if (this._setTimerBeforeGameStart) {
            setTimeout(function () {
                console.log("starting game");
                lobby.endTransitionPhase();
                if (_this.areAllOffline(lobby)) {
                    _this.deleteLobby(lobby);
                }
                else {
                    _this.makeTeams(lobby, game);
                    _this.runGame(game);
                }
            }, this._transitionTime);
        }
    };
    GameManager.prototype.socketJoinGame = function (socketWrap, playerId, lobbyId) {
        var lobby = this._lobbyManager._lobbies[lobbyId];
        if (lobby && lobby._players.has(playerId)) {
            this._lobbyManager._sockets[socketWrap.id] = playerId;
            var player = this._lobbyManager._players[playerId];
            player.socketWrap = socketWrap;
            player.online = true;
            console.log("player joined game", playerId);
        }
        else {
            socketWrap.emit(SocketMessages.redirect, SocketMessages.errorUrlBit);
            console.log("player cant join game");
        }
    };
    GameManager.prototype.socketLeaveGame = function (socketWrap) {
        var leaverId = this._lobbyManager._sockets[socketWrap.id];
        var player = this._lobbyManager._players[leaverId];
        var lobby = this._lobbyManager._lobbies[player.lobbyId];
        if (lobby._inGame) {
            player.online = false;
            console.log("player goes offline");
            if (lobby._transition) {
                return;
            }
            else if (this.areAllOffline(lobby)) {
                this.deleteLobby(lobby);
            }
        }
    };
    GameManager.prototype.areAllOffline = function (lobby) {
        var allOffline = true;
        for (var _i = 0, _a = lobby.getPlayerList(); _i < _a.length; _i++) {
            var playerId = _a[_i];
            var player = this._lobbyManager._players[playerId];
            if (player.online) {
                allOffline = false;
                break;
            }
        }
        return allOffline;
    };
    GameManager.prototype.deleteLobby = function (lobby) {
        var lobbyId = lobby._id;
        for (var _i = 0, _a = lobby.getPlayerList(); _i < _a.length; _i++) {
            var playerId = _a[_i];
            var player = this._lobbyManager._players[playerId];
            delete this._lobbyManager._sockets[player.socketWrap.id];
            delete this._lobbyManager._players[playerId];
        }
        delete this._lobbyManager._lobbies[lobbyId];
        delete this._games[lobbyId];
        console.log("deleting lobby", lobbyId);
    };
    GameManager.prototype.endGame = function (lobby) {
        lobby.switchBackFromInGameStatus();
        for (var _i = 0, _a = lobby.getPlayerList(); _i < _a.length; _i++) {
            var playerId = _a[_i];
            var player = this._lobbyManager._players[playerId];
            if (!player.online) {
                lobby.removePlayer(playerId);
                delete this._lobbyManager._sockets[player.socketWrap.id];
                delete this._lobbyManager._players[playerId];
            }
            else {
                player.socketWrap.emit(SocketMessages.showReturnButton);
            }
        }
    };
    GameManager.prototype.socketProcessGameInput = function (socketWrap) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var playerId = this._lobbyManager._sockets[socketWrap.id];
        if (playerId) {
            var player = this._lobbyManager._players[playerId];
            var lobby = this._lobbyManager._lobbies[player.lobbyId];
            var game = this._games[player.lobbyId];
            if (lobby._inGame && !lobby._transition) {
                game.processPlayerInput(playerId, args);
            }
        }
    };
    GameManager.prototype.makeTeams = function (lobby, game) {
        game.makeDefaultShips();
        var currentShipNum = 0;
        for (var _i = 0, _a = lobby.getPlayerList(); _i < _a.length; _i++) {
            var playerId = _a[_i];
            var player = this._lobbyManager._players[playerId];
            if (player.online) {
                game.addPlayer(playerId, String(currentShipNum));
                currentShipNum = (currentShipNum + 1) % game._defaultShipNumber;
            }
            else {
                lobby.removePlayer(playerId);
                delete this._lobbyManager._players[playerId];
            }
        }
        game.deleteEmptyShips();
    };
    GameManager.prototype.runGame = function (game) {
        if (game.isGameOver() || this._immediatelyEndGame) {
            var somePlayerId = Object.keys(game._players)[0];
            var lobbyId = this._lobbyManager._players[somePlayerId].lobbyId;
            var lobby = this._lobbyManager._lobbies[lobbyId];
            lobby.switchBackFromInGameStatus();
            console.log("ending game");
            for (var _i = 0, _a = Object.keys(game._players); _i < _a.length; _i++) {
                var playerId = _a[_i];
                var player = this._lobbyManager._players[playerId];
                player.socketWrap.emit(SocketMessages.showReturnButton);
            }
        }
        else {
            game.update();
            if (this._instantGameUpdates) {
                this.runGame(game);
            }
            else {
                requestAnimationFrame(this.runGame.bind(this, game));
            }
        }
    };
    GameManager.prototype.clearAllData = function () {
        this._games = {};
    };
    return GameManager;
}());
exports["default"] = GameManager;

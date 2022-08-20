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
        this._refreshTime = 10;
        this._setTimerBeforeGameStart = true;
        this._instantGameUpdates = false;
        this._immediatelyEndGame = false;
        this._runGameAfterTransition = true;
        this._lobbyManager = data;
        io.on("connection", function (socket) {
            var socketWrap = new socketWrap_1["default"](socket);
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
                }
            });
        });
    }
    GameManager.prototype.startGame = function (lobbyId) {
        var _this = this;
        var lobby = this._lobbyManager._lobbies[lobbyId];
        var game = new Game_1["default"]();
        this._games[lobbyId] = game;
        this.makeTeams(lobby);
        game.updateDrawingInstructions();
        if (this._setTimerBeforeGameStart) {
            setTimeout(function () {
                _this.endTransitionPhase(lobby);
            }, this._transitionTime);
        }
    };
    GameManager.prototype.endTransitionPhase = function (lobby) {
        lobby.endTransitionPhase();
        lobby.switchToInGameStatus();
        if (this.areAllOffline(lobby)) {
            this.deleteLobby(lobby);
        }
        else if (this._runGameAfterTransition) {
            var game = this._games[lobby._id];
            this.runGame(game);
        }
    };
    GameManager.prototype.socketJoinGame = function (socketWrap, playerId, lobbyId) {
        var lobby = this._lobbyManager._lobbies[lobbyId];
        if (lobby && lobby._players.has(playerId)) {
            this._lobbyManager._sockets[socketWrap.id] = playerId;
            var player = this._lobbyManager._players[playerId];
            player.socketWrap = socketWrap;
            player.online = true;
            var game = this._games[lobbyId];
            var startTime = game._creationTime + this._transitionTime;
            player.socketWrap.emit(SocketMessages.gameCountdown, startTime);
            this.sendGameStateToPlayer(game, playerId);
        }
        else {
            socketWrap.emit(SocketMessages.redirect, SocketMessages.errorUrlBit);
        }
    };
    GameManager.prototype.deleteGameIfEmpty = function (lobby) {
        if (this.areAllOffline(lobby)) {
            this.deleteLobby(lobby);
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
        delete this._games[lobby._id];
    };
    GameManager.prototype.socketProcessGameInput = function (socketWrap, args) {
        var playerId = this._lobbyManager._sockets[socketWrap.id];
        if (playerId) {
            var player = this._lobbyManager._players[playerId];
            var lobby = this._lobbyManager._lobbies[player.lobbyId];
            var game = this._games[player.lobbyId];
            if (lobby._inGame) {
                game.processPlayerInput(playerId, args);
            }
        }
    };
    GameManager.prototype.makeTeams = function (lobby) {
        var game = this._games[lobby._id];
        game.makeDefaultShips();
        var currentShipNum = 0;
        for (var _i = 0, _a = lobby.getPlayerList(); _i < _a.length; _i++) {
            var playerId = _a[_i];
            game.addPlayer(playerId, String(currentShipNum));
            currentShipNum = (currentShipNum + 1) % game._defaultShipNumber;
        }
        game.deleteEmptyShips();
    };
    GameManager.prototype.runGame = function (game) {
        var _this = this;
        var somePlayerId = Object.keys(game._players)[0];
        var lobbyId = this._lobbyManager._players[somePlayerId].lobbyId;
        var lobby = this._lobbyManager._lobbies[lobbyId];
        if (!lobby)
            return;
        if (game.isGameOver() || this._immediatelyEndGame) {
            game.updateWinnerText();
            lobby.switchBackFromInGameStatus();
            for (var _i = 0, _a = Object.keys(game._players); _i < _a.length; _i++) {
                var playerId = _a[_i];
                var player = this._lobbyManager._players[playerId];
                player.socketWrap.emit(SocketMessages.showReturnButton);
                player.socketWrap.emit(SocketMessages.gamePermanentMessage, game._winnerText);
            }
        }
        else {
            game.update();
            if (this._instantGameUpdates) {
                this.runGame(game);
            }
            else {
                setTimeout(function () {
                    try {
                        game.updateDrawingInstructions();
                        _this.sendGameState(lobby);
                        _this.runGame(game);
                    }
                    catch (_a) { }
                }, this._refreshTime);
            }
        }
    };
    GameManager.prototype.sendGameState = function (lobby) {
        var game = this._games[lobby._id];
        for (var _i = 0, _a = lobby.getPlayerList(); _i < _a.length; _i++) {
            var playerId = _a[_i];
            this.sendGameStateToPlayer(game, playerId);
        }
    };
    GameManager.prototype.sendGameStateToPlayer = function (game, playerId) {
        var player = this._lobbyManager._players[playerId];
        if (!player.online)
            return;
        var shipId = game._players[player.id];
        var ship = game._ships[shipId];
        if (!ship) {
            player.socketWrap.emit(SocketMessages.gameShipHealth, 0);
            player.socketWrap.emit(SocketMessages.gamePermanentMessage, SocketMessages.gameShipEndMessage);
            player.socketWrap.emit(SocketMessages.gameButtonAvailability, game.getTakenRoles(playerId));
        }
        else {
            var shipHealth = ship._health;
            var shipDrawInstructions = game._drawingInstructions[shipId];
            player.socketWrap.emit(SocketMessages.gameState, JSON.stringify(shipDrawInstructions));
            player.socketWrap.emit(SocketMessages.gameShipHealth, shipHealth / 100);
            player.socketWrap.emit(SocketMessages.gameButtonAvailability, game.getTakenRoles(playerId));
        }
    };
    GameManager.prototype.clearAllData = function () {
        this._games = {};
    };
    GameManager.prototype.setDefaultSettings = function () {
        this._setTimerBeforeGameStart = true;
        this._instantGameUpdates = false;
        this._immediatelyEndGame = false;
        this._runGameAfterTransition = true;
    };
    return GameManager;
}());
exports["default"] = GameManager;

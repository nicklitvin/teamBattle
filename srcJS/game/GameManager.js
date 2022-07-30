"use strict";
exports.__esModule = true;
var Game_1 = require("./Game");
var GameManagerData_1 = require("./GameManagerData");
var SocketMessages = require("../client/socketMessages.json");
var GameManager = (function () {
    function GameManager(io, players, lobbies) {
        var _this = this;
        this._data = new GameManagerData_1["default"]();
        this._data.players = players;
        this._data.lobbies = lobbies;
        io.on("connection", function (socket) {
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
        this._data.games[lobbyId] = new Game_1["default"]();
    };
    GameManager.prototype.socketJoinGame = function (id, lobbyId, socket) {
        if (this._data.lobbies[lobbyId].getData().players.has(id)) {
            this._data.players[id].socket = socket;
            console.log("player joined game", id);
        }
    };
    return GameManager;
}());
exports["default"] = GameManager;

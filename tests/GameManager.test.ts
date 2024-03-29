import LobbyManager from "../src/lobby/LobbyManager";
import * as express from "express";
import { Server } from "socket.io";
import SocketWrap from "../src/SocketWrap";
import Lobby from "../src/lobby/Lobby";
import * as SocketMessages from "../src/client/socketMessages.json";
import Position from "../src/game/Position";
import DrawingInstruction from "../src/game/DrawingInstruction";
import Game from "../src/game/Game";

const app : any = express();
const server = app.listen(5000);
const io = new Server(server);

describe("testing gameManager", () => {
    let lobbyManager = new LobbyManager(io);
    lobbyManager._setLeaderJoinTimer = false;
    let gameManager = lobbyManager._gameManager;

    let socketWrapRed = new SocketWrap();
    socketWrapRed.id = "red";

    let socketWrapBlu = new SocketWrap();
    socketWrapBlu.id = "blu";

    let lobbyId : string;
    let lobby : Lobby;

    // create lobby with 2 players
    beforeEach( () => {
        lobbyManager.clearAllData();
        gameManager.clearAllData();
        gameManager.setDefaultSettings();

        lobbyManager.socketCreateLobby(socketWrapRed);
        lobbyId = Object.keys(lobbyManager._lobbies)[0];

        lobbyManager.socketJoinLobby(socketWrapRed,lobbyId,undefined);
        lobbyManager.socketJoinLobby(socketWrapBlu,lobbyId,undefined);

        lobby = lobbyManager._lobbies[lobbyId];
    })

    it("should setup game correctly", () => {
        gameManager._setTimerBeforeGameStart = false;

        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);

        let game = gameManager._games[lobbyId];

        expect(gameManager.areAllOffline(lobby)).toBeTruthy();
        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);
        expect(gameManager.areAllOffline(lobby)).toBeFalsy();

        let redShip = game._ships[game._players[socketWrapRed.id]];
        let bluShip = game._ships[game._players[socketWrapBlu.id]];
        
        expect(redShip).toBeTruthy();
        expect(bluShip).toBeTruthy();
        expect(Object.keys(game._ships).length).toEqual(2);
    })

    it("should delete when nobody joins game", () => {
        gameManager._setTimerBeforeGameStart = false;
        gameManager._runGameAfterTransition = false;

        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        
        gameManager.endTransitionPhase(lobby);

        expect(lobbyManager._lobbies).toEqual({});
        expect(lobbyManager._players).toEqual({});
        expect(gameManager._games).toEqual({});
    })

    it("should send return after game end", () => {
        gameManager._setTimerBeforeGameStart = false;
        gameManager._immediatelyEndGame = true;

        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);

        socketWrapRed.clearSavedMessages();
        socketWrapBlu.clearSavedMessages();

        // remove one ship to display winner text
        let game = gameManager._games[socketWrapRed.id];
        delete game._ships[Object.keys(game._ships)[1]];
        let lastShipId = Object.keys(game._ships)[0];
        let lastShip = game._ships[lastShipId];

        game.updateWinnerText();
        gameManager.endTransitionPhase(lobby);

        let expect0 = [SocketMessages.showReturnButton];
        let expect1 = [
            SocketMessages.gamePermanentMessage,
            `Ship ${lastShip._color} is the winner`
        ];
        expect(socketWrapRed.savedMessages[0]).toEqual(expect0);
        expect(socketWrapBlu.savedMessages[0]).toEqual(expect0);
        expect(socketWrapRed.savedMessages[1]).toEqual(expect1);
        expect(socketWrapBlu.savedMessages[1]).toEqual(expect1);
    })

    it("should take player input", () => {
        gameManager._setTimerBeforeGameStart = false;
        gameManager._runGameAfterTransition = false;

        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);

        let game = gameManager._games[socketWrapRed.id];
        gameManager.endTransitionPhase(lobby);

        // red selects captain role
        let ship = game._ships[game._players[socketWrapRed.id]];
        gameManager.socketProcessGameInput(
            socketWrapRed,
            [SocketMessages.roleSelectKeyword, 
            SocketMessages.captainTitle]
        );
        
        expect(ship._captain.getPlayerCount()).toEqual(1);

        // red chooses target
        let positionMessage = [4,6];
        gameManager.socketProcessGameInput(
            socketWrapRed,
            [positionMessage[0],positionMessage[1]]
        );
        
        expect(ship._target.x).toEqual(positionMessage[0]);
        expect(ship._target.y).toEqual(positionMessage[1]);

        // red chooses different role
        gameManager.socketProcessGameInput(
            socketWrapRed,
            [SocketMessages.roleSelectKeyword,
            SocketMessages.shooterTitle]
        );

        expect(ship._captain.getPlayerCount()).toEqual(0);
        expect(ship._shooter.getPlayerCount()).toEqual(1);

        // blu disconnects and rejoins
        expect(lobbyManager._sockets[socketWrapBlu.id]).toEqual(socketWrapBlu.id);
        expect(lobbyManager._players[socketWrapBlu.id]).toBeTruthy();
        expect(lobbyManager._players[socketWrapBlu.id].lobbyId).toEqual(lobbyId);

        lobbyManager.socketRemovePlayer(socketWrapBlu);
        expect(Object.keys(lobbyManager._sockets).length).toEqual(1);
        expect(Object.keys(lobbyManager._players).length).toEqual(2);

        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);
        expect(Object.keys(lobbyManager._sockets).length).toEqual(2);

        // blu picks scout and sends scout
        let bluShip = game._ships[game._players[socketWrapBlu.id]];
        gameManager.socketProcessGameInput(
            socketWrapBlu,
            [SocketMessages.roleSelectKeyword,
            SocketMessages.scoutTitle]
        )
        expect(bluShip._scout.getPlayerCount()).toEqual(1);
    })

    it("should run game", () => {
        gameManager._setTimerBeforeGameStart = false;
        gameManager._runGameAfterTransition = false;
        gameManager._instantGameUpdates = true;

        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);

        let game = gameManager._games[socketWrapRed.id];
        gameManager.endTransitionPhase(lobby);

        // make ships close to each other
        let redShip = game._ships[game._players[socketWrapRed.id]];
        let bluShip = game._ships[game._players[socketWrapBlu.id]];

        redShip._position = new Position(5,5);
        bluShip._position = new Position(9,5);
        bluShip._health = redShip._shooterDamage;
        redShip._shooterExpirationTime = 10;
        redShip._shooterSpeed = 1;

        // red shoots blu
        gameManager.socketProcessGameInput(
            socketWrapRed,
            [SocketMessages.roleSelectKeyword,
            SocketMessages.shooterTitle]
        )
        gameManager.socketProcessGameInput(
            socketWrapRed,
            [bluShip._position.x,
            bluShip._position.y]
        );

        expect(Object.keys(redShip._shotsSent).length).toEqual(1);

        // run game
        gameManager.runGame(game);
        expect(game.isGameOver()).toBeTruthy();
    })

    it("should send gameUpdates", () => {
        gameManager._setTimerBeforeGameStart = false;
        gameManager._runGameAfterTransition = false;
        gameManager._instantGameUpdates = true;

        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapBlu);
        socketWrapRed.clearSavedMessages();

        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);
        gameManager.socketJoinGame(socketWrapBlu,socketWrapBlu.id,lobbyId);

        // ongame join messages
        let game = gameManager._games[socketWrapRed.id];
        let countdownExpect = [
            SocketMessages.gameCountdown,
            gameManager._transitionTime + game._creationTime
        ];
        let redShip = game._ships[game._players[socketWrapRed.id]];
        expect(socketWrapRed.savedMessages[0]).toEqual(countdownExpect);

        let drawingInformation : DrawingInstruction[] = 
        JSON.parse(socketWrapRed.savedMessages[1][1]);

        let shipVision = drawingInformation[0];
        expect(shipVision._position.x * Game._mapWidth).
            toEqual(redShip._position.x);
        expect(shipVision._position.y * Game._mapHeight).
            toEqual(redShip._position.y);
        expect(shipVision._color).toEqual(game._visionColor);
        expect(shipVision._radius * Game._mapWidth).toEqual(redShip._vision);

        let expectHealthMessage = [
            SocketMessages.gameShipHealth,
            redShip._health/100
        ];
        expect(socketWrapRed.savedMessages[2]).toEqual(expectHealthMessage);

        let expectButtonMessage = [SocketMessages.gameButtonAvailability, []];
        expect(socketWrapRed.savedMessages[3]).toEqual(expectButtonMessage);

        // taken roles
        redShip._shooter.addPlayer(socketWrapRed.id);
        redShip._captain.addPlayer("some other player");
        socketWrapRed.clearSavedMessages();
        game.updateDrawingInstructions();
        gameManager.sendGameState(lobby);
        let expectButtonMessage1 = [ SocketMessages.gameButtonAvailability,
            [
                [SocketMessages.captainTitle, game._takenRoleColor],
                [SocketMessages.shooterTitle, game._currentRoleColor]
            ]
        ]
        expect(socketWrapRed.savedMessages[2]).toEqual(expectButtonMessage1);

        // inprogress role
        redShip.shootProjectile(socketWrapRed.id,new Position(0,0));
        socketWrapRed.clearSavedMessages();
        game.updateDrawingInstructions();
        gameManager.sendGameState(lobby);
        let expectButtonMessage2 = [ SocketMessages.gameButtonAvailability,
            [
                [SocketMessages.captainTitle, game._takenRoleColor],
                [SocketMessages.shooterTitle, SocketMessages.gameButtonInProgress]
            ]
        ]
        expect(socketWrapRed.savedMessages[2]).toEqual(expectButtonMessage2);
        // ingame messages
        redShip._health = 42;
        socketWrapRed.clearSavedMessages();
        game.updateDrawingInstructions();
        gameManager.sendGameState(lobby);
        expectHealthMessage = [SocketMessages.gameShipHealth,redShip._health/100];
        expect(socketWrapRed.savedMessages[1]).toEqual(expectHealthMessage);

        // ship dead messages
        delete game._ships[redShip._id];
        socketWrapRed.clearSavedMessages();
        game.updateDrawingInstructions();
        gameManager.sendGameState(lobby);
        expectHealthMessage = [SocketMessages.gameShipHealth,0];
        expect(socketWrapRed.savedMessages[0]).toEqual(expectHealthMessage);
        let expectDeadMessage = [
            SocketMessages.gamePermanentMessage,
            SocketMessages.gameShipEndMessage
        ];
        expect(socketWrapRed.savedMessages[1]).toEqual(expectDeadMessage);
    })
    it("should update winner text alone", () => {
        gameManager._setTimerBeforeGameStart = false;
        gameManager._runGameAfterTransition = false;
        gameManager._instantGameUpdates = true;

        lobbyManager.socketRemovePlayer(socketWrapBlu);
        lobbyManager.socketStartGame(socketWrapRed);
        lobbyManager.socketRemovePlayer(socketWrapRed);
        socketWrapRed.clearSavedMessages();
        gameManager.socketJoinGame(socketWrapRed,socketWrapRed.id,lobbyId);

        expect(lobby.getPlayerCount()).toEqual(1);

        let game = gameManager._games[lobby._id];
        socketWrapRed.clearSavedMessages();
        gameManager.runGame(game);

        let expected = [SocketMessages.gamePermanentMessage,game._winnerText];
        expect(socketWrapRed.savedMessages[1]).toEqual(expected);
    })
})
server.close();
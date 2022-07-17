import Game from "../src/Game";
import Position from "../src/Position";

describe("testing Game Class", () => {
    it("should add player", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";

        game.addShip(shipId);
        game.addPlayer(playerId,shipId);
        expect(game.players[playerId]).toBe(shipId);
    })
    it("should not add player", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";

        game.addPlayer(playerId,shipId);
        expect(Object.keys(game.players).length).toBe(0);
    })
    it("should make one player the captain", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";

        game.addShip(shipId);
        game.addPlayer(playerId,shipId);
        game.processPlayerInput(playerId,["select","captain"]);

        let ship = game.ships[shipId];

        expect(ship.captain.isPlayerHere(playerId)).toBe(true);
        game.processPlayerInput(playerId,["select","captain"]);

        game.processPlayerInput(playerId,["5","5"]);
        expect(ship.target).toEqual(new Position(5,5));

        let secondPlayer = "player2";
        game.addPlayer(secondPlayer,shipId);
        game.processPlayerInput(secondPlayer,["select","captain"]);
        expect(ship.captain.isPlayerHere(secondPlayer)).toBe(false);

        game.processPlayerInput(secondPlayer,["9,9"]);
        expect(ship.target).toEqual(new Position(5,5));
    })
})
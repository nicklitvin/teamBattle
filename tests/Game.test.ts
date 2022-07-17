import Game from "../src/Game";
import Position from "../src/Position";

describe("testing Game Class", () => {
    it("should add player", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";

        game.addPlayer(playerId,shipId);
        expect(game.players[playerId]).toBe(shipId);
    })
    it("should process player input", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";

        game.addPlayer(playerId,shipId);
        game.addShip(shipId);
        game.processPlayerInput(playerId,["5","5"]);
        expect(game.ships[shipId].target)
            .toEqual(new Position(5,5));
    })
})
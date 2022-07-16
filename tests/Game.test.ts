import Game from "../src/Game";

describe("testing Game Class", () => {
    it("should add player", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";

        game.addPlayer(playerId,shipId);
        expect(game.players[playerId]).toBe(shipId);
    })
})
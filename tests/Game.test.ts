import Game from "../src/Game";
import Position from "../src/Position";
import Role from "../src/Role";
import Ship from "../src/Ship";

describe("testing Game Class", () => {
    it("should add player to players", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";

        game.addShip(shipId);
        game.addPlayer(playerId,shipId);
        expect(game.players[playerId]).toBe(shipId);
    })
    it("should not add player to players", () => {
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

        let ship = game.ships[shipId];
        ship.captain = new Role(1,Ship.captainTitle);
        
        game.processPlayerInput(
            playerId,
            [Ship.roleSelectKeyword,Ship.captainTitle]
        );

        expect(ship.captain.isPlayerHere(playerId)).toBe(true);
        game.processPlayerInput(
            playerId,
            [Ship.roleSelectKeyword,Ship.captainTitle]
        );
        game.processPlayerInput(playerId,["5","5"]);
        expect(ship.target).toEqual(new Position(5,5));

        let secondPlayer = "player2";
        game.addPlayer(secondPlayer,shipId);
        game.processPlayerInput(
            secondPlayer,
            [Ship.roleSelectKeyword,Ship.captainTitle]
        );
        expect(ship.captain.isPlayerHere(secondPlayer)).toBe(false);

        game.processPlayerInput(secondPlayer,["9,9"]);
        expect(ship.target).toEqual(new Position(5,5));
    })
})
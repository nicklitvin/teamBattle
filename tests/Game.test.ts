import Game from "../src/Game";
import Position from "../src/Position";
import Role from "../src/Role";
import Ship from "../src/Ship";

describe("testing player/role adding", () => {
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
describe("testing game combat", () => {
    it("should hit ship", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";
        let enemyId = "ship2";

        game.addShip(shipId,new Position(5,5));
        game.addShip(enemyId,new Position(6,5));
        game.addPlayer(playerId,shipId);

        let ship = game.ships[shipId];
        let enemy = game.ships[enemyId];

        ship.radius = 0.5
        enemy.radius = 0.5
        ship.shotSpeed = 1;
        ship.shotExpirationTime = 2;

        game.ships[shipId].shootProjectile(playerId,new Position(10,5));
        expect(game.ships[shipId].shots[playerId]).toBeTruthy();
        game.update();

        expect(game.ships[enemyId].health).toEqual(ship.health - ship.shotDamage);
        expect(game.ships[shipId].shots[playerId]).toBeFalsy();
    })
})
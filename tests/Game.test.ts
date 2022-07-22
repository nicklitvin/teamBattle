import Game from "../src/Game";
import Position from "../src/Position";
import Ship from "../src/Ship";

describe("testing player/role adding", () => {
    it("should add player to players", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";

        game.addShip(shipId);
        game.addPlayer(playerId,shipId);
        expect(game.getPlayers()[playerId]).toBe(shipId);
    })
    it("should not add player to players", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";

        game.addPlayer(playerId,shipId);
        expect(Object.keys(game.getPlayers()).length).toBe(0);
    })
    it("should make one player the captain", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";

        game.addShip(shipId);
        game.addPlayer(playerId,shipId);

        let ship = game.getShips()[shipId];
        
        game.processPlayerInput(
            playerId,
            [Ship.roleSelectKeyword,Ship.captainTitle]
        );

        expect(ship.getRole(Ship.captainTitle).isPlayerHere(playerId)).toBe(true);
        game.processPlayerInput(
            playerId,
            [Ship.roleSelectKeyword,Ship.captainTitle]
        );
        game.processPlayerInput(playerId,["5","5"]);
        expect(ship.getTarget()).toEqual(new Position(5,5));

        let secondPlayer = "player2";
        game.addPlayer(secondPlayer,shipId);
        game.processPlayerInput(
            secondPlayer,
            [Ship.roleSelectKeyword,Ship.captainTitle]
        );
        expect(ship.getRole(Ship.captainTitle).isPlayerHere(secondPlayer)).toBe(false);

        game.processPlayerInput(secondPlayer,["9,9"]);
        expect(ship.getTarget()).toEqual(new Position(5,5));
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

        let ship = game.getShips()[shipId];
        let enemy = game.getShips()[enemyId];

        ship.setRadius(0.5);
        enemy.setRadius(0.5);
        ship.setShooterSpeed(1);
        ship.setShooterExpiration(2);

        game.getShips()[shipId].shootProjectile(playerId,new Position(10,5));
        expect(game.getShips()[shipId].getShots()[playerId]).toBeTruthy();
        game.update();

        expect(game.getShips()[enemyId].getHealth()).toEqual(
            ship.getHealth() - ship.getShooterDamage()
        );
        expect(game.getShips()[shipId].getShots()[playerId]).toBeFalsy();
    })
    it("should kill ship", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";
        let enemyId = "ship2";

        game.addShip(shipId,new Position(5,5));
        game.addShip(enemyId,new Position(6,5));
        game.addPlayer(playerId,shipId);

        let ship = game.getShips()[shipId];
        let enemy = game.getShips()[enemyId];

        ship.setRadius(0.5);
        enemy.setRadius(0.5);
        enemy.setHealth(ship.getShooterDamage());

        ship.setShooterSpeed(1);
        ship.setShooterExpiration(2);

        game.getShips()[shipId].shootProjectile(playerId,new Position(10,5));
        expect(game.getShips()[shipId].getShots()[playerId]).toBeTruthy();
        game.update();

        expect(game.getShips()[enemyId]).toBeFalsy();
        expect(game.getShips()[shipId].getShots()[playerId]).toBeFalsy();
    })
})
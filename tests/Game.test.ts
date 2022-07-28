import Game from "../src/game/Game";
import Position from "../src/game/Position";
import Ship from "../src/game/Ship";

describe("testing player/role adding", () => {
    it("should add player to players", () => {
        let game = new Game();
        let gameData = game.getData();

        let playerId = "player1";
        let shipId = "ship1";

        game.addShip(shipId);
        game.addPlayer(playerId,shipId);
        expect(gameData.players[playerId]).toBe(shipId);
    })
    it("should not add player to players", () => {
        let game = new Game();
        let gameData = game.getData();

        let playerId = "player1";
        let shipId = "ship1";

        game.addPlayer(playerId,shipId);
        expect(Object.keys(gameData.players).length).toBe(0);
    })
    it("should make one player the captain", () => {
        let game = new Game();
        let gameData = game.getData();
        let playerId = "player1";
        let shipId = "ship1";
        let moveTarget = new Position(5,5);

        game.addShip(shipId);
        game.addPlayer(playerId,shipId);

        let ship = gameData.ships[shipId];
        let shipData = ship.getData();
        
        game.processPlayerInput(
            playerId,
            [Ship.roleSelectKeyword,Ship.captainTitle]
        );

        expect(shipData.captain.isPlayerHere(playerId)).toEqual(true);
        game.processPlayerInput(
            playerId,
            [Ship.roleSelectKeyword,Ship.captainTitle]
        );
        game.processPlayerInput(playerId,["5","5"]);
        expect(shipData.target).toEqual(moveTarget);

        let secondPlayer = "player2";
        game.addPlayer(secondPlayer,shipId);
        game.processPlayerInput(
            secondPlayer,
            [Ship.roleSelectKeyword,Ship.captainTitle]
        );
        expect(shipData.captain.isPlayerHere(secondPlayer)).toEqual(false);

        game.processPlayerInput(secondPlayer,["9,9"]);
        expect(shipData.target).toEqual(moveTarget);
    })
})
describe("testing game combat", () => {
    it("should hit ship", () => {
        let game = new Game();
        let gameData = game.getData();
        let playerId = "player1";
        let shipId = "ship1";
        let enemyId = "ship2";

        game.addShip(shipId,new Position(5,5));
        game.addShip(enemyId,new Position(6,5));
        game.addPlayer(playerId,shipId);

        let ship = gameData.ships[shipId];
        let shipData = ship.getData();
        let enemy = gameData.ships[enemyId];
        let enemyData = enemy.getData();

        shipData.radius = 0.5;
        enemyData.radius = 0.5;
        shipData.shooterSpeed = 1;
        shipData.shooterExpirationTime = 2;

        gameData.ships[shipId].shootProjectile(playerId,new Position(10,5));
        expect(shipData.shotsSent[playerId]).toBeTruthy();
        game.update();

        expect(enemyData.health).toEqual(
            shipData.health - shipData.shooterDamage
        );
        expect(shipData.shotsSent[playerId]).toBeFalsy();
    })
    it("should kill ship", () => {
        let game = new Game();
        let gameData = game.getData();

        let playerId = "player1";
        let shipId = "ship1";
        let enemyId = "ship2";

        game.addShip(shipId,new Position(5,5));
        game.addShip(enemyId,new Position(6,5));
        game.addPlayer(playerId,shipId);

        let ship = gameData.ships[shipId];
        let shipData = ship.getData();
        let enemy = gameData.ships[enemyId];
        let enemyData = enemy.getData();

        shipData.radius = 0.5;
        enemyData.radius = 0.5;
        enemyData.health = shipData.shooterDamage; 
        shipData.shooterSpeed = 1;
        shipData.shooterExpirationTime = 2;

        gameData.ships[shipId].shootProjectile(playerId,new Position(10,5));
        expect(shipData.shotsSent[playerId]).toBeTruthy();
        game.update();

        expect(gameData.ships[enemyId]).toBeFalsy();
        expect(shipData.shotsSent[playerId]).toBeFalsy();
    })
})
describe("testing vision", () => {
    it("should see properly", () => {
        let game = new Game();
        let gameData = game.getData();

        let shipId = "ship1";
        let enemyId = "ship2";
        game.addShip(shipId,new Position(5,5));
        game.addShip(enemyId,new Position(6,5));

        let ship = gameData.ships[shipId];
        let shipData = ship.getData();
        shipData.vision = 1;

        let see = game.getVisibleProjectiles(ship);
        expect(see.length).toEqual(2);

        shipData.position = new Position(4,5);
        see = game.getVisibleProjectiles(ship);
        expect(see.length).toEqual(1);

        shipData.shooterSpeed = 1;
        shipData.shooterExpirationTime = 2;
        ship.shootProjectile("1",new Position(3,5));
        
        shipData.scoutSpeed = 1;
        shipData.scoutExpirationTime = 2;
        ship.sendScout("1",new Position(3,5));

        ship.move();

        see = game.getVisibleProjectiles(ship);
        expect(see.length).toEqual(3);

        ship.move();
        
        see = game.getVisibleProjectiles(ship);
        expect(see.length).toEqual(1);
    })
})
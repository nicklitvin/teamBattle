import Game from "../src/game/Game";
import Position from "../src/client/Position";
import * as SocketMessages from "../src/client/socketMessages.json";

describe("testing player/role adding", () => {
    it("should add player to players", () => {
        let game = new Game();

        let playerId = "player1";
        let shipId = "ship1";

        game.addShip(shipId);
        game.addPlayer(playerId,shipId);
        expect(game._players[playerId]).toBe(shipId);
    })
    it("should not add player to players", () => {
        let game = new Game();

        let playerId = "player1";
        let shipId = "ship1";

        game.addPlayer(playerId,shipId);
        expect(Object.keys(game._players).length).toBe(0);
    })
    it("should make one player the captain", () => {
        let game = new Game();
        let playerId = "player1";
        let shipId = "ship1";
        let moveTarget = new Position(5,5);

        game.addShip(shipId);
        game.addPlayer(playerId,shipId);

        let ship = game._ships[shipId];
        
        game.processPlayerInput(
            playerId,
            [SocketMessages.roleSelectKeyword,SocketMessages.captainTitle]
        );

        expect(ship._captain.isPlayerHere(playerId)).toEqual(true);
        game.processPlayerInput(
            playerId,
            [SocketMessages.roleSelectKeyword,SocketMessages.captainTitle]
        );
        game.processPlayerInput(playerId,["5","5"]);
        expect(ship._target).toEqual(moveTarget);

        let secondPlayer = "player2";
        game.addPlayer(secondPlayer,shipId);
        game.processPlayerInput(
            secondPlayer,
            [SocketMessages.roleSelectKeyword,SocketMessages.captainTitle]
        );
        expect(ship._captain.isPlayerHere(secondPlayer)).toEqual(false);

        game.processPlayerInput(secondPlayer,["9,9"]);
        expect(ship._target).toEqual(moveTarget);
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

        let ship = game._ships[shipId];
        let enemy = game._ships[enemyId];

        ship._radius = 0.5;
        enemy._radius = 0.5;
        ship._shooterSpeed = 1;
        ship._shooterExpirationTime = 2;

        game._ships[shipId].shootProjectile(playerId,new Position(10,5));
        expect(ship._shotsSent[playerId]).toBeTruthy();
        game.update();

        expect(enemy._health).toEqual(
            ship._health - ship._shooterDamage
        );
        expect(ship._shotsSent[playerId]).toBeFalsy();
    })
    it("should kill ship", () => {
        let game = new Game();

        let playerId = "player1";
        let shipId = "ship1";
        let enemyId = "ship2";

        game.addShip(shipId,new Position(5,5));
        game.addShip(enemyId,new Position(6,5));
        game.addPlayer(playerId,shipId);

        let ship = game._ships[shipId];
        let enemy = game._ships[enemyId];

        ship._radius = 0.5;
        enemy._radius = 0.5;
        enemy._health = ship._shooterDamage; 
        ship._shooterSpeed = 1;
        ship._shooterExpirationTime = 2;

        game._ships[shipId].shootProjectile(playerId,new Position(10,5));
        expect(ship._shotsSent[playerId]).toBeTruthy();
        game.update();

        expect(game._ships[enemyId]).toBeFalsy();
        expect(ship._shotsSent[playerId]).toBeFalsy();
    })
})
describe("testing vision", () => {
    it("should see properly", () => {
        let game = new Game();

        let shipId = "ship1";
        let enemyId = "ship2";
        game.addShip(shipId,new Position(5,5));
        game.addShip(enemyId,new Position(6,5));

        let ship = game._ships[shipId];
        ship._vision = 1;

        let see = game.getVisibleProjectiles(ship);
        expect(see.length).toEqual(2);

        ship._position = new Position(4,5);
        see = game.getVisibleProjectiles(ship);
        expect(see.length).toEqual(1);

        ship._shooterSpeed = 1;
        ship._shooterExpirationTime = 2;
        ship.shootProjectile("1",new Position(3,5));
        
        ship._scoutSpeed = 1;
        ship._scoutExpirationTime = 2;
        ship.sendScout("1",new Position(3,5));

        ship.move();

        see = game.getVisibleProjectiles(ship);
        expect(see.length).toEqual(3);

        ship.move();
        
        see = game.getVisibleProjectiles(ship);
        expect(see.length).toEqual(1);
    })
})
describe("testing game end", () => {
    let game = new Game();

    let shipId = "ship1";
    let enemyId = "ship2";
    game.addShip(shipId,new Position(5,5));
    game.addShip(enemyId,new Position(6,5));

    let ship = game._ships[shipId];
    let enemy = game._ships[enemyId];
    ship._radius = 0.5;
    ship._shooterSpeed = 1;
    ship._shooterExpirationTime = 2;
    enemy._radius = 0.5;
    enemy._health = ship._shooterDamage;

    expect(game.isGameOver()).toBeFalsy();

    ship.shootProjectile("1",enemy._position);

    game.update();

    expect(enemy._health).toEqual(0);
    expect(game.isGameOver()).toBeTruthy();
})
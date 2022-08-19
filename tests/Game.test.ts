import Game from "../src/game/Game";
import Position from "../src/game/Position";
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
describe("testing game end", () => {
    it("should end", () => {
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
})
describe("testing vision", () => {
    it("ship should see", () => {
        let game = new Game();

        let shipId = "ship1";
        let enemyId = "ship2";
        game.addShip(shipId,new Position(3,5));
        game.addShip(enemyId,new Position(9,5));
    
        let ship = game._ships[shipId];
        let enemy = game._ships[enemyId];
        ship._vision = 3;
        enemy._vision = 3;
    
        game.updateDrawingInstructions();
    
        // instructions = vision + itself
        expect(game._drawingInstructions[shipId].length).toEqual(2);
        expect(game._drawingInstructions[enemyId].length).toEqual(2);
    
        ship._position = new Position(7,5);
        game.updateDrawingInstructions();
    
        // instructions = vision + itself + enemy
        expect(game._drawingInstructions[shipId].length).toEqual(3);
        expect(game._drawingInstructions[enemyId].length).toEqual(3);
    
        ship.sendScout("id",new Position(0,0));
        game.updateDrawingInstructions();
    
        // instructions = vision + itself + scoutVision + enemy + scout
        expect(game._drawingInstructions[shipId].length).toEqual(5);
        expect(game._drawingInstructions[enemyId].length).toEqual(4);
    
        enemy.shootProjectile("id", new Position(0,0));
        game.updateDrawingInstructions();
    
        expect(game._drawingInstructions[shipId].length).toEqual(6);
        expect(game._drawingInstructions[enemyId].length).toEqual(5);
    })
    it("scout should see", () => {
        let game = new Game();

        let shipId = "ship1";
        let playerId = "id";
        game.addShip(shipId,new Position(0,0));
    
        let ship = game._ships[shipId];
        ship._radius = 0.5;
        ship._vision = 3;
    
        // scout grants vision
        ship.sendScout("id",new Position(10,10));
        let scout = ship._scoutsSent[playerId];
        scout._position = new Position(8,8);
        
        game.updateDrawingInstructions();
        expect(game._drawingInstructions[shipId].length).toEqual(4);
    
        // shot is not within scout or ship vision range
        ship.shootProjectile(playerId,new Position(10,0));
        let shot = ship._shotsSent[playerId];
        shot._position = new Position(8,0);
    
        game.updateDrawingInstructions();
        expect(game._drawingInstructions[shipId].length).toEqual(4);
    
        // shot is within scout vision range
        shot._position = new Position(
            scout._position.x + ship._vision + shot._radius - 0.001,
            scout._position.y
        );
        game.updateDrawingInstructions();
        expect(game._drawingInstructions[shipId].length).toEqual(5);
    
        // scouts vision doesn't overlap
        let playerId1 = "id1";
        ship.sendScout(playerId1,new Position(7,6));
        let scout1 = ship._scoutsSent[playerId1];
        scout1._position = new Position(scout._position.x,scout._position.y);
        
        // ship + shipVision + 2scouts + 2scoutVision + shot
        game.updateDrawingInstructions();
        expect(game._drawingInstructions[shipId].length).toEqual(7);
    })
})
describe("testing drawing instructions", () => {
    it("should send correct instructions", () => {
        let game = new Game();

        let shipId = "ship1";
        let startPosition = new Position(0,0);
    
        game.addShip(shipId,startPosition);
        let ship = game._ships[shipId];
        ship._color = "red";
        ship.setTarget(new Position(5,5));
    
        game.updateDrawingInstructions();
        let instructions = game._drawingInstructions[shipId];
    
        expect(instructions[0]._position.expandByDimensions(Game._mapWidth,Game._mapHeight)).toEqual(ship._position);
        expect(instructions[0]._color).toEqual(game._visionColor);
        expect(instructions[0]._radius * Game._mapWidth).toEqual(ship._vision);
    
        expect(instructions[1]._radius * Game._mapWidth).toEqual(ship._radius);
        expect(instructions[1]._color).toEqual(ship._color);
    
        let enemyId = "enemy";
        let enemyPosition = new Position(0,0.1);
        game.addShip(enemyId,enemyPosition);
        let enemyShip = game._ships[enemyId];
        enemyShip._color = "blue";
    
        game.updateDrawingInstructions();
    
        // shipInstructions
        instructions = game._drawingInstructions[shipId];
        expect(instructions.length).toEqual(3);
        expect(instructions[1]._color).toEqual(ship._color);
        expect(instructions[2]._color).toEqual(game._enemyColor);
        expect(instructions[2]._position.expandByDimensions(
            SocketMessages.gameWidth,SocketMessages.gameHeight)
        ).toEqual(enemyShip._position);

        // enemyShipInstructions
        instructions = game._drawingInstructions[enemyId];
        expect(instructions.length).toEqual(3);
        expect(instructions[1]._color).toEqual(enemyShip._color);
        expect(instructions[2]._color).toEqual(game._enemyColor);
    })
})
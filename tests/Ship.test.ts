import Ship from "../src/game/Ship"
import Position from "../src/game/Position"
import * as SocketMessages from "../src/client/socketMessages.json";
import Game from "../src/game/Game";

describe("testing Ship move", () => {
    let ship = new Ship(new Position(1,1));
    ship._speed = 5;

    it("should move toward target", () => {
        ship.setTarget(new Position(4,5));
        ship.move();
        expect(ship._position).toEqual(ship._target);
    })
    it("should move toward target 1", () => {
        ship._position =new Position(4,5);
        ship.setTarget(new Position(7,1));
        ship.move();
        expect(ship._position).toEqual(ship._target);
    })
    it("shouldn't move", () => {
        ship.move();
        expect(ship._position).toEqual(ship._target);
    })
    it("shouldn't move too fast", () => {
        ship._position = new Position(7,1);
        ship.setTarget(new Position(1,1));
        ship.move();
        expect(ship._position).toEqual(
            new Position(7 - ship._speed,1)
        );
    })
    it("should move straight up", () => {
        ship._position =new Position(1,1);
        ship.setTarget(new Position(1,6));
        ship.move();
        expect(ship._position).toEqual(new Position(1,6));
    })
    it("should not pass target", () => {
        ship._position =new Position(2,2);
        ship.setTarget(new Position(2,3));
        ship.move();
        expect(ship._position).toEqual(new Position(2,3));
    })
    it("should stay within boundary", () => {
        ship.setTarget(new Position(20,-1));
        let radius = ship._radius;

        expect(ship._target).toEqual(
            new Position(Game._mapWidth - radius,radius)
        );
    })
    it("should stay within boundary 1", () => {
        ship.setTarget(new Position(0.05,0.05));
        let radius = ship._radius;

        expect(ship._target).toEqual(new Position(radius,radius));
    })
})

describe("testing medic heal", () => {
    it("should not heal ship", () => {
        let ship = new Ship();
        ship._medicHeal = 1;;
        ship._health = 50;
        ship.heal();
        expect(ship._health).toEqual(50);
    })
    it("should heal ship", () => {
        let ship = new Ship();

        ship._medicHeal = 1;
        ship.processPlayerInput("1",[SocketMessages.roleSelectKeyword,SocketMessages.medicTitle]);
        ship.processPlayerInput("2",[SocketMessages.roleSelectKeyword,SocketMessages.medicTitle])
        
        ship._health = 50;
        ship.heal();
        expect(ship._health).toEqual(51.5)
    })
    it("should not overheal", () => {
        let ship = new Ship();

        ship._medicHeal = 1;
        ship.processPlayerInput("1",[SocketMessages.roleSelectKeyword,SocketMessages.medicTitle]);
        ship.heal();
        expect(ship._health).toEqual(100);
    })
})

describe("testing role select", () => {
    it("should not error", () => {
        let ship = new Ship();
        let playerId = "id";
        ship.processPlayerInput(
            playerId,
            [SocketMessages.roleSelectKeyword, "badRole"]
        );

        ship.processPlayerInput(playerId, [0,0])
    })
    it("should select/deselect role", () => {
        let ship = new Ship();
        let id = "id0";

        ship.processPlayerInput(
            id,
            [SocketMessages.roleSelectKeyword, SocketMessages.shooterTitle]
        );
        ship.processPlayerInput(
            "id1",
            [SocketMessages.roleSelectKeyword, SocketMessages.shooterTitle]
        );
        
        expect(ship._shooter.getPlayerCount()).toEqual(2);
        expect(ship._medic.getPlayerCount()).toEqual(0);
        expect(ship._medic.getPlayerCount()).toEqual(0);

        ship.processPlayerInput(
            id,
            [SocketMessages.roleSelectKeyword, SocketMessages.medicTitle]
        );

        expect(ship._shooter.getPlayerCount()).toEqual(1);
        expect(ship._captain.getPlayerCount()).toEqual(0);
        expect(ship._medic.getPlayerCount()).toEqual(1);
    })

    it("should stop role change midshot", () => {
        let ship = new Ship();
        let playerId = "0";
        
        ship._shooterExpirationTime = 1;
        
        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.shooterTitle]);
        expect(ship._shooter.getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[1,1]);
        expect(ship._shotsSent[playerId]).toBeTruthy();
        expect(ship._scoutsSent[playerId]).toBeFalsy();
        
        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.scoutTitle]);
        expect(ship._shooter.getPlayerCount()).toEqual(1);
        expect(ship._scout.getPlayerCount()).toEqual(0);

        ship.move();
        expect(ship._shotsSent[playerId]).toBeFalsy();

        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.scoutTitle]);
        expect(ship._shooter.getPlayerCount()).toEqual(0);
        expect(ship._scout.getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[1,1]);
        expect(ship._shotsSent[playerId]).toBeFalsy();
        expect(ship._scoutsSent[playerId]).toBeTruthy();
    })
})

describe("testing shooting", () => {
    it("should shoot", () => {
        let playerId = "id";
        let ship = new Ship();
        let shootTarget = new Position(3,4);

        ship._position =new Position(0,0);
        ship._shooterSpeed = 2.5;
        ship._shooterExpirationTime = 2;

        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.shooterTitle]);
        expect(ship._shooter.getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[shootTarget.x,shootTarget.y]);
        expect(ship._shotsSent[playerId]._target).toEqual(shootTarget);
        expect(ship.isShotAvailable(playerId)).toEqual(false);
        
        ship.processPlayerInput(playerId,[0,0]);
        expect(ship._shotsSent[playerId]._target).toEqual(shootTarget);
    })
    it("should default up", () => {
        let playerId = "id";
        let ship = new Ship();

        ship._position =new Position(0,0);
        ship._shooterSpeed = 2.5;
        ship._shooterExpirationTime = 2;
        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.shooterTitle]);
        ship.processPlayerInput(playerId,[ship._position.x,ship._position.y]);

        expect(ship._shotsSent[playerId]._target).toEqual(new Position(0,5));
    })
    it("should expire shot", () => {
        let playerId = "id";
        let ship = new Ship();

        ship._position =new Position(0,0);
        ship._shooterSpeed = 5;
        ship._shooterExpirationTime = 2;
        
        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.shooterTitle]);
        ship.processPlayerInput(playerId,[ship._position.x,ship._position.y]);
        expect(ship._shotsSent[playerId]).toBeTruthy();

        ship.move();
        expect(ship._shotsSent[playerId]).toBeTruthy();

        ship.move();
        expect(ship._shotsSent[playerId]).toBeFalsy();
    })
    it("should send scout", () => {
        let playerId = "id";
        let ship = new Ship();
        let scoutTarget = new Position(3,4);

        ship._position = new Position(0,0);
        ship._scoutSpeed = 2.5;
        ship._scoutExpirationTime = 2;

        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.scoutTitle]);
        expect(ship._scout.getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[scoutTarget.x,scoutTarget.y]);
        expect(ship._scoutsSent[playerId]._target).toEqual(scoutTarget);
        expect(ship.isScoutAvailable(playerId)).toEqual(false);
        
        ship.processPlayerInput(playerId,[0,0]);
        expect(ship._scoutsSent[playerId]._target).toEqual(scoutTarget);
    })
})
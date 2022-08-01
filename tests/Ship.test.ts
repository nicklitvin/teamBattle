import Ship from "../src/game/Ship"
import Position from "../src/game/Position"
import * as SocketMessages from "../src/client/socketMessages.json";

describe("testing Ship move", () => {
    let ship = new Ship(new Position(1,1));
    let shipData = ship.getData();
    shipData.speed = 5;

    it("should move toward target", () => {
        ship.setTarget(new Position(4,5));
        ship.move();
        expect(shipData.position).toEqual(shipData.target);
    })
    it("should move toward target 1", () => {
        shipData.position =new Position(4,5);
        ship.setTarget(new Position(7,1));
        ship.move();
        expect(shipData.position).toEqual(shipData.target);
    })
    it("shouldn't move", () => {
        ship.move();
        expect(shipData.position).toEqual(shipData.target);
    })
    it("shouldn't move too fast", () => {
        shipData.position =new Position(7,1);
        ship.setTarget(new Position(1,1));
        ship.move();
        expect(shipData.position).toEqual(
            new Position(7 - shipData.speed,1)
        );
    })
    it("should move straight up", () => {
        shipData.position =new Position(2,2);
        ship.setTarget(new Position(2,7));
        ship.move();
        expect(shipData.position).toEqual(new Position(2,7));
    })
    it("should not pass target", () => {
        shipData.position =new Position(2,2);
        ship.setTarget(new Position(2,3));
        ship.move();
        expect(shipData.position).toEqual(new Position(2,3));
    })
    it("should stay within boundary", () => {
        ship.setTarget(new Position(20,-1));
        let radius = shipData.radius;

        expect(shipData.target).toEqual(
            new Position(16-radius,radius)
        );
    })
    it("should stay within boundary 1", () => {
        ship.setTarget(new Position(0.05,0.05));
        let radius = shipData.radius;

        expect(shipData.target).toEqual(new Position(radius,radius));
    })
})

describe("testing medic heal", () => {
    it("should not heal ship", () => {
        let ship = new Ship();
        let shipData = ship.getData();
        shipData.medicHeal = 1;;
        shipData.health = 50;
        ship.heal();
        expect(shipData.health).toEqual(50);
    })
    it("should heal ship", () => {
        let ship = new Ship();
        let shipData = ship.getData();

        shipData.medicHeal = 1;
        ship.processPlayerInput("1",[SocketMessages.roleSelectKeyword,SocketMessages.medicTitle]);
        ship.processPlayerInput("2",[SocketMessages.roleSelectKeyword,SocketMessages.medicTitle])
        
        shipData.health = 50;
        ship.heal();
        expect(shipData.health).toEqual(51.5)
    })
    it("should not overheal", () => {
        let ship = new Ship();
        let shipData = ship.getData();

        shipData.medicHeal = 1;
        ship.processPlayerInput("1",[SocketMessages.roleSelectKeyword,SocketMessages.medicTitle]);
        ship.heal();
        expect(shipData.health).toEqual(100);
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
        let shipData = ship.getData();
        let id = "id0";

        ship.processPlayerInput(
            id,
            [SocketMessages.roleSelectKeyword, SocketMessages.shooterTitle]
        );
        ship.processPlayerInput(
            "id1",
            [SocketMessages.roleSelectKeyword, SocketMessages.shooterTitle]
        );
        
        expect(shipData.shooter.getPlayerCount()).toEqual(2);
        expect(shipData.medic.getPlayerCount()).toEqual(0);
        expect(shipData.medic.getPlayerCount()).toEqual(0);

        ship.processPlayerInput(
            id,
            [SocketMessages.roleSelectKeyword, SocketMessages.medicTitle]
        );

        expect(shipData.shooter.getPlayerCount()).toEqual(1);
        expect(shipData.captain.getPlayerCount()).toEqual(0);
        expect(shipData.medic.getPlayerCount()).toEqual(1);
    })

    it("should stop role change midshot", () => {
        let ship = new Ship();
        let shipData = ship.getData();
        let playerId = "0";
        
        shipData.shooterExpirationTime = 1;
        
        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.shooterTitle]);
        expect(shipData.shooter.getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[1,1]);
        expect(shipData.shotsSent[playerId]).toBeTruthy();
        expect(shipData.scoutsSent[playerId]).toBeFalsy();
        
        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.scoutTitle]);
        expect(shipData.shooter.getPlayerCount()).toEqual(1);
        expect(shipData.scout.getPlayerCount()).toEqual(0);

        ship.move();
        expect(shipData.shotsSent[playerId]).toBeFalsy();

        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.scoutTitle]);
        expect(shipData.shooter.getPlayerCount()).toEqual(0);
        expect(shipData.scout.getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[1,1]);
        expect(shipData.shotsSent[playerId]).toBeFalsy();
        expect(shipData.scoutsSent[playerId]).toBeTruthy();
    })
})

describe("testing shooting", () => {
    it("should shoot", () => {
        let playerId = "id";
        let ship = new Ship();
        let shipData = ship.getData();
        let shootTarget = new Position(3,4);

        shipData.position =new Position(0,0);
        shipData.shooterSpeed = 2.5;
        shipData.shooterExpirationTime = 2;

        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.shooterTitle]);
        expect(shipData.shooter.getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[shootTarget.x,shootTarget.y]);
        expect(shipData.shotsSent[playerId].target).toEqual(shootTarget);
        expect(ship.isShotAvailable(playerId)).toEqual(false);
        
        ship.processPlayerInput(playerId,[0,0]);
        expect(shipData.shotsSent[playerId].target).toEqual(shootTarget);
    })
    it("should default up", () => {
        let playerId = "id";
        let ship = new Ship();
        let shipData = ship.getData();

        shipData.position =new Position(0,0);
        shipData.shooterSpeed = 2.5;
        shipData.shooterExpirationTime = 2;
        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.shooterTitle]);
        ship.processPlayerInput(playerId,[shipData.position.x,shipData.position.y]);

        expect(shipData.shotsSent[playerId].target).toEqual(new Position(0,5));
    })
    it("should expire shot", () => {
        let playerId = "id";
        let ship = new Ship();
        let shipData = ship.getData();

        shipData.position =new Position(0,0);
        shipData.shooterSpeed = 5;
        shipData.shooterExpirationTime = 2;
        
        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.shooterTitle]);
        ship.processPlayerInput(playerId,[shipData.position.x,shipData.position.y]);
        expect(shipData.shotsSent[playerId]).toBeTruthy();

        ship.move();
        expect(shipData.shotsSent[playerId]).toBeTruthy();

        ship.move();
        expect(shipData.shotsSent[playerId]).toBeFalsy();
    })
    it("should send scout", () => {
        let playerId = "id";
        let ship = new Ship();
        let shipData = ship.getData();
        let scoutTarget = new Position(3,4);

        shipData.position =new Position(0,0);
        shipData.scoutSpeed = 2.5;
        shipData.scoutExpirationTime = 2;

        ship.processPlayerInput(playerId,[SocketMessages.roleSelectKeyword,SocketMessages.scoutTitle]);
        expect(shipData.scout.getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[scoutTarget.x,scoutTarget.y]);
        expect(shipData.scoutsSent[playerId].target).toEqual(scoutTarget);
        expect(ship.isScoutAvailable(playerId)).toEqual(false);
        
        ship.processPlayerInput(playerId,[0,0]);
        expect(shipData.scoutsSent[playerId].target).toEqual(scoutTarget);
    })
})
import Ship from "../src/Ship"
import Position from "../src/Position"

describe("testing Ship move", () => {
    let ship = new Ship(new Position(1,1));
    ship.setSpeed(5)

    it("should move toward target", () => {
        ship.setTarget(new Position(4,5));
        ship.move();
        expect(ship.getPosition()).toEqual(ship.getTarget());
    })
    it("should move toward target 1", () => {
        ship.setPosition(new Position(4,5));
        ship.setTarget(new Position(7,1));
        ship.move();
        expect(ship.getPosition()).toEqual(ship.getTarget());
    })
    it("shouldn't move", () => {
        ship.move();
        expect(ship.getPosition()).toEqual(ship.getTarget());
    })
    it("shouldn't move too fast", () => {
        ship.setPosition(new Position(7,1));
        ship.setTarget(new Position(1,1));
        ship.move();
        expect(ship.getPosition()).toEqual(
            new Position(7 - ship.getSpeed(),1)
        );
    })
    it("should move straight up", () => {
        ship.setPosition(new Position(2,2));
        ship.setTarget(new Position(2,7));
        ship.move();
        expect(ship.getPosition()).toEqual(new Position(2,7));
    })
    it("should not pass target", () => {
        ship.setPosition(new Position(2,2));
        ship.setTarget(new Position(2,3));
        ship.move();
        expect(ship.getPosition()).toEqual(new Position(2,3));
    })
    it("should stay within boundary", () => {
        ship.setTarget(new Position(20,-1));
        let radius = ship.getRadius();

        expect(ship.getTarget()).toEqual(
            new Position(16-radius,radius)
        );
    })
    it("should stay within boundary 1", () => {
        ship.setTarget(new Position(0.05,0.05));
        let radius = ship.getRadius();

        expect(ship.getTarget()).toEqual(new Position(radius,radius));
    })
})

describe("testing medic heal", () => {
    it("should not heal ship", () => {
        let ship = new Ship();
        ship.setMedicHeal(1);
        ship.setHealth(50);
        ship.heal();
        expect(ship.getHealth()).toEqual(50);
    })
    it("should heal ship", () => {
        let ship = new Ship();
        ship.setMedicHeal(1);
        ship.processPlayerInput("1",[Ship.roleSelectKeyword,Ship.medicTitle]);
        ship.processPlayerInput("2",[Ship.roleSelectKeyword,Ship.medicTitle])
        ship.setHealth(50);
        ship.heal();
        expect(ship.getHealth()).toEqual(51.5)
    })
    it("should not overheal", () => {
        let ship = new Ship();
        ship.setMedicHeal(1);
        ship.processPlayerInput("1",[Ship.roleSelectKeyword,Ship.medicTitle]);
        ship.heal();
        expect(ship.getHealth()).toEqual(100);
    })
})

describe("testing role select", () => {
    it("should not error", () => {
        let ship = new Ship();
        let playerId = "id";
        ship.processPlayerInput(
            playerId,
            [Ship.roleSelectKeyword, "badRole"]
        );

        ship.processPlayerInput(playerId, [0,0])
    })
    it("should select/deselect role", () => {
        let ship = new Ship();
        let id = "id0";

        ship.processPlayerInput(
            id,
            [Ship.roleSelectKeyword, Ship.shooterTitle]
        );
        ship.processPlayerInput(
            "id1",
            [Ship.roleSelectKeyword, Ship.shooterTitle]
        );
        
        expect(ship.getRole(Ship.shooterTitle).getPlayerCount()).toEqual(2);
        expect(ship.getRole(Ship.medicTitle).getPlayerCount()).toEqual(0);
        expect(ship.getRole(Ship.medicTitle).getPlayerCount()).toEqual(0);

        ship.processPlayerInput(
            id,
            [Ship.roleSelectKeyword, Ship.medicTitle]
        );

        expect(ship.getRole(Ship.shooterTitle).getPlayerCount()).toEqual(1);
        expect(ship.getRole(Ship.captainTitle).getPlayerCount()).toEqual(0);
        expect(ship.getRole(Ship.medicTitle).getPlayerCount()).toEqual(1);
    })

    it("should stop role change midshot", () => {
        let ship = new Ship();
        let playerId = "0";
        ship.setShooterExpiration(1);
        
        ship.processPlayerInput(playerId,[Ship.roleSelectKeyword,Ship.shooterTitle]);
        expect(ship.getRole(Ship.shooterTitle).getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[1,1]);
        expect(ship.getShots()[playerId]).toBeTruthy();
        expect(ship.getScouts()[playerId]).toBeFalsy();
        
        ship.processPlayerInput(playerId,[Ship.roleSelectKeyword,Ship.scoutTitle]);
        expect(ship.getRole(Ship.shooterTitle).getPlayerCount()).toEqual(1);
        expect(ship.getRole(Ship.scoutTitle).getPlayerCount()).toEqual(0);

        ship.move();
        expect(ship.getShots()[playerId]).toBeFalsy();

        ship.processPlayerInput(playerId,[Ship.roleSelectKeyword,Ship.scoutTitle]);
        expect(ship.getRole(Ship.shooterTitle).getPlayerCount()).toEqual(0);
        expect(ship.getRole(Ship.scoutTitle).getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[1,1]);
        expect(ship.getShots()[playerId]).toBeFalsy();
        expect(ship.getScouts()[playerId]).toBeTruthy();
    })
})

describe("testing shooting", () => {
    it("should shoot", () => {
        let playerId = "id";
        let ship = new Ship();
        let shootTarget = new Position(3,4);

        ship.setPosition(new Position(0,0));
        ship.setShooterSpeed(2.5);
        ship.setShooterExpiration(2);

        ship.processPlayerInput(playerId,[Ship.roleSelectKeyword,Ship.shooterTitle]);
        expect(ship.getRole(Ship.shooterTitle).getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[shootTarget.x,shootTarget.y]);
        expect(ship.getShots()[playerId].getTarget()).toEqual(shootTarget);
        expect(ship.isShotAvailable(playerId)).toEqual(false);
        
        ship.processPlayerInput(playerId,[0,0]);
        expect(ship.getShots()[playerId].getTarget()).toEqual(shootTarget);
    })
    it("should default up", () => {
        let playerId = "id";
        let ship = new Ship();
        ship.setPosition(new Position(0,0));
        ship.setShooterSpeed(2.5);
        ship.setShooterExpiration(2);
        ship.processPlayerInput(playerId,[Ship.roleSelectKeyword,Ship.shooterTitle]);
        ship.processPlayerInput(playerId,[ship.getPosition().x,ship.getPosition().y]);

        expect(ship.getShots()[playerId].getTarget()).toEqual(new Position(0,5));
    })
    it("should expire shot", () => {
        let playerId = "id";
        let ship = new Ship();
        ship.setPosition(new Position(0,0));
        ship.setShooterSpeed(5);
        ship.setShooterExpiration(2);
        
        ship.processPlayerInput(playerId,[Ship.roleSelectKeyword,Ship.shooterTitle]);
        ship.processPlayerInput(playerId,[ship.getPosition().x,ship.getPosition().y]);
        expect(ship.getShots()[playerId]).toBeTruthy();

        ship.move();
        expect(ship.getShots()[playerId]).toBeTruthy();

        ship.move();
        expect(ship.getShots()[playerId]).toBeFalsy();
    })
    it("should send scout", () => {
        let playerId = "id";
        let ship = new Ship();
        let scoutTarget = new Position(3,4);

        ship.setPosition(new Position(0,0));
        ship.setScoutSpeed(2.5);
        ship.setScoutExpiration(2);

        ship.processPlayerInput(playerId,[Ship.roleSelectKeyword,Ship.scoutTitle]);
        expect(ship.getRole(Ship.scoutTitle).getPlayerCount()).toEqual(1);

        ship.processPlayerInput(playerId,[scoutTarget.x,scoutTarget.y]);
        expect(ship.getScouts()[playerId].getTarget()).toEqual(scoutTarget);
        expect(ship.isScoutAvailable(playerId)).toEqual(false);
        
        ship.processPlayerInput(playerId,[0,0]);
        expect(ship.getScouts()[playerId].getTarget()).toEqual(scoutTarget);
    })
})
import Ship from "../src/Ship"
import Position from "../src/Position"

describe("testing Ship move", () => {
    let ship = new Ship(new Position(1,1));
    ship.speed = 5;

    it("should move toward target", () => {
        ship.setTarget(new Position(4,5));
        ship.move();
        expect(ship.position).toEqual(ship.target);
    })
    it("should move toward target 1", () => {
        ship.position = new Position(4,5)
        ship.setTarget(new Position(7,1));
        ship.move();
        expect(ship.position).toEqual(ship.target);
    })
    it("shouldn't move", () => {
        ship.move();
        expect(ship.position).toEqual(ship.target);
    })
    it("shouldn't move too fast", () => {
        ship.position = new Position(7,1)
        ship.setTarget(new Position(1,1));
        ship.move();
        expect(ship.position).toEqual(new Position(7 - ship.speed,1));
    })
    it("should move straight up", () => {
        ship.position = new Position(2,2)
        ship.setTarget(new Position(2,7));
        ship.move();
        expect(ship.position).toEqual(new Position(2,7));
    })
    it("should not pass target", () => {
        ship.position = new Position(2,2)
        ship.setTarget(new Position(2,3));
        ship.move();
        expect(ship.position).toEqual(new Position(2,3));
    })
    it("should stay within boundary", () => {
        ship.setTarget(new Position(20,-1));
        expect(ship.target).toEqual(new Position(16-ship.sideLength/2,ship.sideLength/2));
    })
    it("should stay within boundary 1", () => {
        ship.setTarget(new Position(0.05,0.05));
        expect(ship.target).toEqual(new Position(ship.sideLength/2,ship.sideLength/2));
    })
})

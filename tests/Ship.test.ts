import Ship from "../src/Ship"
import Position from "../src/Position"

describe("testing Ship move", () => {
    let ship = new Ship("1", new Position(0,0));
    ship.speed = 5;

    it("should move toward target", () => {
        ship.setTarget(new Position(3,4));
        ship.move();
        expect(ship.position).toEqual(ship.target);
    })
    it("should move toward target 1", () => {
        ship.setTarget(new Position(0,8));
        ship.move();
        expect(ship.position).toEqual(ship.target);
    })
    it("shouldn't move", () => {
        ship.move();
        expect(ship.position).toEqual(ship.target);
    })
    it("shouldn't move too fast", () => {
        ship.setTarget(new Position(0,0));
        ship.move();
        expect(ship.position).toEqual(new Position(0,8 - ship.speed));
    })
    it("moving straight up", () => {
        ship.setTarget(new Position(0,8));
        ship.move();
        expect(ship.position).toEqual(new Position(0,8));
    })
})
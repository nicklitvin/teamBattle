import Position from "../src/Position";
import Shot from "../src/Shot"

describe("testing shot", () => {
    it("should squish target", () => {
        let shot : Shot = new Shot(new Position(0,0),new Position(6,8), 2.5, 2);
        expect(shot.target).toEqual(new Position(3,4));

        shot = new Shot(new Position(0,0),new Position(100,0), 1, 1);
        expect(shot.target).toEqual(new Position(1,0));
    })
    it("should extend target", () => {
        let shot : Shot = new Shot(new Position(0,0),new Position(3,-4), 2, 5);
        expect(shot.target).toEqual(new Position(6,-8));

        shot = new Shot(new Position(0,0),new Position(0,1), 10, 10);
        expect(shot.target).toEqual(new Position(0,100));
    })
})
import MyMath from "../src/client/MyMath";
import Position from "../src/client/Position";
import Projectile from "../src/client/Projectile";

class TestProjectile implements Projectile {
    _position: Position;
    _radius: number;
    _speed: number;
    _target: Position;
}

describe("testing math functions", () => {
    it("should round", () => {
        expect(MyMath.round(4.1234567,2)).toEqual(4.12);
        expect(MyMath.round(-1.23,6)).toEqual(-1.23);
        expect(MyMath.round(-0,1)).toEqual(0);
    })
    it("should move", () => {
        let start = new Position(0,0);
        let end = new Position(6,8);
        let speed = 5;
        let expecting = new Position(3,4);
        let result = MyMath.move(start,end,speed);
        expect(result).toEqual(expecting);
        expect(start !== result).toBeTruthy();

        start = new Position(0,0);
        end = new Position(-6,8);
        speed = 5;
        expecting = new Position(-3,4);
        result = MyMath.move(start,end,speed);
        expect(result).toEqual(expecting);

        start = new Position(0,0);
        end = new Position(0,10);
        speed = 5;
        expecting = new Position(0,5);
        result = MyMath.move(start,end,speed);
        expect(result).toEqual(expecting);

        start = new Position(0,0);
        end = new Position(0,0);
        speed = 5;
        expecting = new Position(0,0);
        result = MyMath.move(start,end,speed);
        expect(result).toEqual(expecting);

        start = new Position(0,0);
        end = new Position(0,10);
        speed = 0;
        expecting = new Position(0,0);
        result = MyMath.move(start,end,speed);
        expect(result).toEqual(expecting);
    })
    it("should extend to max range", () => {
        let from = new Position(0,0);
        let to = new Position(6,8);
        let speed = 5;
        let time = 1;
        let expecting = new Position(3,4);
        let result = MyMath.extendToMaxRange(from,to,speed,time);
        expect(result).toEqual(expecting);

        from = new Position(0,0);
        to = new Position(6,-8);
        speed = 5;
        time = 2;
        expecting = new Position(6,-8);
        result = MyMath.extendToMaxRange(from,to,speed,time);
        expect(result).toEqual(expecting);

        from = new Position(0,0);
        to = new Position(0,-10);
        speed = 2;
        time = 10;
        expecting = new Position(0,-20);
        result = MyMath.extendToMaxRange(from,to,speed,time);
        expect(result).toEqual(expecting);

        from = new Position(-10,-10);
        to = new Position(10,10);
        speed = 0;
        time = 1;
        expecting = new Position(-10,-10);
        result = MyMath.extendToMaxRange(from,to,speed,time);
        expect(result).toEqual(expecting);

        from = new Position(0,0);
        to = new Position(1,1);
        speed = 1;
        time = 0;
        expecting = new Position(0,0);
        result = MyMath.extendToMaxRange(from,to,speed,time);
        expect(result).toEqual(expecting);
    })
    it("should catch intersection", () => {
        let c1 = new TestProjectile();
        c1._radius = 10;
        c1._position = new Position(0,0);

        let c2 = new TestProjectile();
        c2._radius = 10;
        c2._position = new Position(20,0);

        expect(MyMath.getDistanceBetween(c1,c2)).toEqual(20);
        expect(MyMath.doCirclesIntersect(c1,c2)).toBeFalsy();

        c1._radius = 11;
        expect(MyMath.doCirclesIntersect(c1,c2)).toBeTruthy();

        c1._position = new Position(20,0);
        c1._radius = 0;
        expect(MyMath.doCirclesIntersect(c1,c2)).toBeTruthy();
    })
})
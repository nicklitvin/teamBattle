import Position from "./Position";
import {Projectile} from "./Projectile";

export default class MyMath {
    private static roundDigit = 4;

    public static round(val : number) : number {
        let roundingVal = 10 ** MyMath.roundDigit;
        val = Math.round(val * roundingVal) / roundingVal;
        if (val == -0) val = 0;
        return val
    }

    /**
     * Returns new position after move towards target given speed.
     * @param from 
     * @param to 
     * @param speed 
     */
    public static move(from : Position, to : Position, speed : number) : Position {
        let xDiff = to.x - from.x;
        let yDiff = to.y - from.y;
        let newPosition = from.copy();

        if ( (xDiff**2 + yDiff**2)**(1/2) <= speed) {
            newPosition = to.copy()
        } else if (xDiff == 0) {
            newPosition.y += speed * Math.sign(yDiff);
        } else {
            let angle = MyMath.round(Math.atan(yDiff/xDiff));
            newPosition.x += Math.cos(angle) * speed * Math.sign(xDiff);
            newPosition.y += Math.sin(angle) * speed * Math.sign(xDiff);
        }
        newPosition.round();
        return newPosition;
    }

    public static extendToMaxRange(from : Position, to : Position,
         speed : number, time : number) : Position 
    {
        let xDiff = to.x - from.x;
        let yDiff = to.y - from.y;
        
        if (speed * time == 0) return from;
        let currDistanceRatio = (xDiff**2 + yDiff**2)**(1/2) / (speed * time);

        if (!currDistanceRatio) return new Position(from.x,from.y + speed * time);

        xDiff *= 1/currDistanceRatio;
        yDiff *= 1/currDistanceRatio;
        
        let newPosition = new Position(from.x + xDiff, from.y + yDiff);
        newPosition.round();
        return newPosition;
    }

    public static doCirclesIntersect(c1 : Projectile, c2 : Projectile) : boolean {
        let dist = ((c2.position.x - c1.position.x)**2 +
            (c2.position.y - c1.position.y)**2) ** (1/2);
            
        if (dist <= c1.radius + c2.radius) return true;
        return false;
    }

    public static getDistanceBetween(c1 : Projectile, c2 : Projectile) : number {
        let val = ((c2.position.x - c1.position.x)**2 + 
            (c2.position.y - c1.position.y)**2) ** (1/2);
        return this.round(val);
    }
}
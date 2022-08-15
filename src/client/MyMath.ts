import Position from "./Position";
import Projectile from "./Projectile";

/**
 * MyMath is a static class that completes specific computations
 * used in the teamBattle project.
 */
export default class MyMath {
    private static roundDigit = 4;

    /**
     * Rounds the value to the digit specified or the default 
     * specified in the MyMath class.
     * 
     * @param val 
     * @returns 
     */
    public static round(val : number, roundDigit? : number) : number {
        if (!roundDigit) roundDigit = MyMath.roundDigit;

        let roundingVal = 10 ** roundDigit;
        val = Math.round(val * roundingVal) / roundingVal;
        if (val == -0) val = 0;
        return val
    }

    /**
     * Returns new position after move towards target given speed and time
     * for the move. From and To Positions are not modified. 
     * @param from 
     * @param to 
     * @param speed 
     */
    public static move(from : Position, to : Position, speed : number, time = 1) : Position {
        let xDiff = to.x - from.x;
        let yDiff = to.y - from.y;
        let newPosition = from.copy();

        if (time == 0) {
            return newPosition;
        }

        if ( (xDiff**2 + yDiff**2)**(1/2) <= speed * time) {
            newPosition = to.copy()
        } else if (xDiff == 0) {
            newPosition.y += speed * Math.sign(yDiff) * time;
        } else {
            let angle = MyMath.round(Math.atan(yDiff/xDiff));
            newPosition.x += Math.cos(angle) * speed * Math.sign(xDiff) * time;
            newPosition.y += Math.sin(angle) * speed * Math.sign(xDiff) * time;
        }
        newPosition.round();
        return newPosition;
    }

    /**
     * Returns expected position of object given its speed, time passed, and 
     * its direction.
     * 
     * @param from start position
     * @param to target position
     * @param speed speed of the object
     * @param time spent in travel
     * @returns 
     */
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

    /**
     * @param c1 projectile
     * @param c2 projectile
     * @returns if projectiles intersect
     */
    public static doCirclesIntersect(c1 : Projectile, c2 : Projectile) : boolean {
        let dist = this.getDistanceBetween(c1,c2);
        if (dist < c1._radius + c2._radius) return true;
        return false;
    }

    /**
     * @param c1 projectile
     * @param c2 projectile
     * @returns distance between centers of projectiles
     */
    public static getDistanceBetween(c1 : Projectile, c2 : Projectile) : number {
        let val = ((c2._position.x - c1._position.x)**2 + 
            (c2._position.y - c1._position.y)**2) ** (1/2);
        return this.round(val);
    }
}
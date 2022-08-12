import MyMath from "./MyMath";
import Position from "./Position";
import Projectile from "./Projectile";
import Ship from "./Ship";

/**
 * Game stores ships and which ships each player is associated with.
 * A player cannot be added without a legit and existing ship.
 * Can process player input to make an action inside the game.
 */
export default class Game {
    /** _players = {PlayerId : ShipId} */
    public _players : { [playerId : string]: string} = {};
    public _ships : { [shipId: string]: Ship } = {};

    public addPlayer(playerId : string, shipId : string) {
        if (Object.keys(this._ships).includes(shipId)) {
            this._players[playerId] = shipId;
        } else {
            // console.log("no such ship");
        }
    }

    public addShip(shipId : string, position? : Position) {
        let ship = new Ship(position);
        ship.setId(shipId);
        this._ships[shipId] = ship;
    }

    /**
     * Sends player input to their corresponding ship for processing.
     * Input specified in Ship class under function with the same name.
     * 
     * @param playerId 
     * @param args 
     */
    public processPlayerInput(playerId : string, args : any[])  {
        try {
            let shipId = this._players[playerId];
            let ship = this._ships[shipId];
            ship.processPlayerInput(playerId,args);
        } catch {
            // console.log("game inputError");
        }
    }

    /**
     * Moves all ships and resolves collisions. 
     */
    public update()  {
        for (let ship of Object.values(this._ships)) {
            ship.move();
        }

        for (let ship of Object.values(this._ships)) {
            for (let enemy of Object.values(this._ships)) {

                if (ship._id == enemy._id) continue;

                for (let shotEntry of Object.entries(enemy._shotsSent)) {
                    let shooter = shotEntry[0];
                    let shot = shotEntry[1];

                    if (MyMath.doCirclesIntersect(shot,ship)) {
                        ship.takeDamage();
                        enemy.deleteShot(shooter);

                        if (ship._health == 0) {
                            delete this._ships[ship._id];
                            break;
                        }
                    }
                }
            }
        }
    }

    /**
     * @param ship 
     * @returns All projectiles within its vision (including itself)
     */
    public getVisibleProjectiles(ship : Ship) : Projectile[] {
        let list : Projectile[] = [];

        for (let enemy of Object.values(this._ships)) {

            if (MyMath.getDistanceBetween(ship,enemy) <= ship._vision) {
                list.push(ship);
            }
            for (let shot of Object.values(enemy._shotsSent)) {
                if (MyMath.getDistanceBetween(ship,shot) <= ship._vision) {
                    list.push(shot)
                }
            }
            for (let shot of Object.values(enemy._scoutsSent)) {
                if (MyMath.getDistanceBetween(ship,shot) <= ship._vision) {
                    list.push(shot)
                }
            }
        }
        return list;
    }
}
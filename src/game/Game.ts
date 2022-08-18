import DrawingInstruction from "../clientModules/DrawingInstruction";
import MyMath from "../clientModules/MyMath";
import Position from "../clientModules/Position";
import Projectile from "../clientModules/Projectile";
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
    public _defaultShipNumber = 4;
    public static _mapWidth = 12;
    public static _mapHeight = 9;
    public _winnerText : string;
    public _drawingInstructions : { [shipId: string] : DrawingInstruction[]} = {};
    public _visionColor = "grey";
    public _enemyColor = "black";
    public _creationTime : number;

    public addPlayer(playerId : string, shipId : string) {
        this._creationTime = Date.now();
        if (Object.keys(this._ships).includes(shipId)) {
            this._players[playerId] = shipId;
        } else {
            // //console.log("no such ship");
        }
    }

    /**
     * Creates and adds a ship to the game. Position has a default value, but
     * color will be undefined unless specified.
     * 
     * @param shipId 
     * @param position 
     * @param color 
     */
    public addShip(shipId : string, position? : Position, color? : string) {
        let ship = new Ship(position);
        ship.setId(shipId);
        if (color) ship.setColor(color);
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
            // //console.log("game inputError");
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
                    
                            if (Object.keys(this._ships).length == 1) {
                                this.updateWinnerText();
                                return;
                            } else {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Creates text stating the last ship stating.
     */
    public updateWinnerText() {
        let shipId = Object.keys(this._ships)[0];
        this._winnerText = `Ship ${shipId} is the winner`;
    }


    /**
     * Updates drawing instructions for every ship still in the game.
     */
    public updateDrawingInstructions() {
        for (let shipId of Object.keys(this._ships)) {
            let ship = this._ships[shipId];
            let instructions : DrawingInstruction[] = [];

            let shipTarget = ship._target || ship._position.copy();
            // shipVision
            let shipVision : Projectile = {
                _position : ship._position,
                _target : shipTarget,
                _radius : ship._vision, 
                _speed : ship._speed
            }
            let shipVisionInstruction = new DrawingInstruction(shipVision,this._visionColor,Game._mapWidth, Game._mapHeight);
            instructions.push(shipVisionInstruction);

            // scoutVision
            for (let scout of Object.values(ship._scoutsSent)) {
                let scoutVision : Projectile = {
                    _position : scout._position,
                    _target : scout._target,
                    _radius : ship._vision ,
                    _speed : scout._speed 
                }
                let instruction = new DrawingInstruction(scoutVision,this._visionColor,Game._mapWidth, Game._mapHeight);
                instructions.push(instruction);
            }

            // ship
            let shipProjectile : Projectile = {
                _position : ship._position,
                _target : shipTarget,
                _radius : ship._radius,
                _speed : ship._speed
            }
            let shipInstruction = new DrawingInstruction(shipProjectile, ship._color,Game._mapWidth, Game._mapHeight);
            instructions.push(shipInstruction);

            // ship scouts
            for (let scout of Object.values(ship._scoutsSent)) {
                let scoutInstruction = new DrawingInstruction(scout,ship._color,Game._mapWidth, Game._mapHeight);
                instructions.push(scoutInstruction);
            }
            // ship shots
            for (let shot of Object.values(ship._shotsSent)) {
                let shotInstruction = new DrawingInstruction(shot,ship._color,Game._mapWidth, Game._mapHeight);

                if (MyMath.getDistanceBetween(shot,ship) < ship._vision + shot._radius) {
                    instructions.push(shotInstruction);
                } else {
                    for (let scout of Object.values(ship._scoutsSent)) {
                        if (MyMath.getDistanceBetween(shot,scout) < ship._vision + shot._radius) {
                            instructions.push(shotInstruction);
                            break;
                        }
                    }
                }
            }

            // enemy projectiles
            let enemies = this.getVisibleEnemyProjectiles(ship);
            for (let enemy of enemies) {
                let enemyInstruction = new DrawingInstruction(enemy,this._enemyColor,Game._mapWidth, Game._mapHeight);
                instructions.push(enemyInstruction);
            }

            this._drawingInstructions[shipId] = instructions;
        }
    }

    /**
     * Returns all enemy projectiles that are visible to the ship whether it's
     * fully or partly.
     * 
     * @param ship 
     * @returns 
     */
    public getVisibleEnemyProjectiles(ship : Ship) {
        let list : Projectile[] = [];

        for (let enemy of Object.values(this._ships)) {
            if (ship._id == enemy._id) continue;

            if (MyMath.getDistanceBetween(ship,enemy) < ship._vision + enemy._radius) {
                list.push(ship);
            }
            for (let thing of 
                Object.values(enemy._shotsSent).concat(Object.values(enemy._scoutsSent))
            ){
                if (MyMath.getDistanceBetween(ship,thing) < ship._vision + thing._radius) {
                    list.push(thing)
                }
            }
        }
        return list;
    }

    /**
     * Creates and adds 4 ships to the game.
     */
    public makeDefaultShips() {
        let testShip = new Ship();

        let position0 = new Position(
            testShip._radius,
            testShip._radius
        );
        let position1 = new Position(
            testShip._radius,
            Game._mapHeight - testShip._radius 
        );
        let position2 = new Position(
            Game._mapWidth - testShip._radius,
            testShip._radius
        );
        let position3 = new Position(
            Game._mapWidth - testShip._radius,
            Game._mapHeight - testShip._radius
        );

        this.addShip("0",position0,"red");
        this.addShip("1",position1,"blue");
        this.addShip("2",position2,"green");
        this.addShip("3",position3,"yellow");
    }

    /**
     * Deletes all ships that have no occupants.
     */
    public deleteEmptyShips() {
        let occupiedShips = Object.values(this._players);
        let shipIds = Object.keys(this._ships);

        for (let shipId of shipIds) {
            if (!occupiedShips.includes(shipId)) {
                delete this._ships[shipId];
            }
        }
    }

    /**
     * Returns true if only one ship remains
     * 
     * @returns 
     */
    public isGameOver() : boolean {
        return Object.keys(this._ships).length <= 1;
    }
}
import GameData from "./GameData";
import MyMath from "./MyMath";
import Position from "./Position";
import Ship from "./Ship";

/**
 * Game stores ships and which ships each player is associated with.
 * Game processes player input accordingly. Cannot add players if no
 * ships exist.
 */
export default class Game {
    /** 
     * Stores all data relevant to the game.
     */
    private _gameData = new GameData(); 

    public addPlayer(playerId : string, shipId : string) : void {
        if (Object.keys(this._gameData.ships).includes(shipId)) {
            this._gameData.players[playerId] = shipId;
        } else {
            // console.log("no such ship");
        }
    }

    public addShip(shipId : string, position? : Position) : void {
        this._gameData.ships[shipId] = new Ship(position);
        this._gameData.ships[shipId].getData().id = shipId;
    }

    public processPlayerInput(playerId : string, args : any[]) : void {
        try {
            let shipId = this._gameData.players[playerId];
            let ship = this._gameData.ships[shipId];
            ship.processPlayerInput(playerId,args);
        } catch {
            // console.log("game inputError");
        }
    }

    public update() : void {
        for (let ship of Object.values(this._gameData.ships)) {
            ship.move();
        }

        for (let ship of Object.values(this._gameData.ships)) {
            for (let enemy of Object.values(this._gameData.ships)) {
                let shipData = ship.getData();
                let enemyData = enemy.getData();

                if (shipData.id == enemyData.id) continue;

                for (let shotEntry of Object.entries(enemyData.shotsSent)) {
                    let shooter = shotEntry[0];
                    let shot = shotEntry[1];
                    let shipProjectileData = ship.getProjectileData(); 

                    if (MyMath.doCirclesIntersect(shot,shipProjectileData)) {
                        ship.takeDamage();
                        enemy.deleteShot(shooter);

                        if (!shipData.health) {
                            delete this._gameData.ships[shipData.id];
                            break;
                        }
                    }
                }
            }
        }
    }

    /**
     * @returns all game data (NOT A COPY)
     */
    public getData() : GameData {return this._gameData}
}
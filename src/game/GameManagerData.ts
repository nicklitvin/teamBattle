import LobbyManagerData from "../lobby/LobbyManagerData";
import Game from "./Game";

export default class GameManagerData {
    public games : {[lobbyId : string] : Game} = {};
    public lobbyData : LobbyManagerData;
    /** unts of time: ms */
    public transitionTime = 1000*5;
}
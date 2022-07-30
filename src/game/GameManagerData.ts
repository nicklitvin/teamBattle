import LobbyManagerData from "../lobby/LobbyManagerData";
import Game from "./Game";

export default class GameManagerData {
    public games : {[lobbyId : string] : Game} = {};
    public lobbyData : LobbyManagerData;
    public transitionTime = 1000*5;
}
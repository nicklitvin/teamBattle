import Game from "./Game";

export default class GameManagerData {
    public games : {[lobbyId : string] : Game} = {};
}
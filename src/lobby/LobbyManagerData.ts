import { Socket } from "socket.io";
import Lobby from "./Lobby";

export default class LobbyManagerData {
    public players : {[playerId : string] : Socket} = {};
    public lobbys : {[lobbyId : string] : Lobby} = {};

    public lobbyIdLength = 6;
}
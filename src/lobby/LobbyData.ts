export default class LobbyData {
    public id : string;
    public redirectToLobby : string;
    public redirectToGame : string;
    public players : Set<String> = new Set();
    public leader : string;
    public countText : string;
    public inGame = false;
    public transition = false;
}
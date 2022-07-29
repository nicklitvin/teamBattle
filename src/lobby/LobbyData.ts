export default class LobbyData {
    public id : string;
    public redirect : string;
    public players : Set<String> = new Set();
    public captain : string;
    public countText : string;
}
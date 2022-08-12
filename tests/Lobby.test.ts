import Lobby from "../src/lobby/Lobby";

describe("testing lobby", () => {
    it("should add players", () => {
        let lobby = new Lobby("id");

        lobby.addPlayer("id1");
        expect(lobby.getPlayerCount()).toEqual(1);
        expect(lobby._countText).toEqual("Players in lobby: 1")

        lobby.removePlayer("fake");
        expect(lobby.getPlayerCount()).toEqual(1);
        expect(lobby._countText).toEqual("Players in lobby: 1")

        lobby.removePlayer("id1");
        expect(lobby.getPlayerCount()).toEqual(0);
        expect(lobby._countText).toEqual("Players in lobby: 0")
    })
    it("should track leader", () => {
        let lobby = new Lobby("id");
        let first = "id1";
        let second = "id2";

        lobby.addPlayer(first);
        expect(lobby._leader).toEqual(first);

        lobby.addPlayer(second);
        expect(lobby._leader).toEqual(first);

        lobby.removePlayer(first);
        expect(lobby._leader).toEqual(second);

        lobby.removePlayer(second);
        expect(lobby._leader).toEqual(second);
    })
})
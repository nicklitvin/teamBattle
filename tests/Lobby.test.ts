import Lobby from "../src/lobby/Lobby";

describe("testing lobby", () => {
    it("should add players", () => {
        let lobby = new Lobby("id");
        let data = lobby.getData();

        lobby.addPlayer("id1");
        expect(lobby.getPlayerCount()).toEqual(1);
        expect(data.countText).toEqual("Players in lobby: 1")

        lobby.removePlayer("fake");
        expect(lobby.getPlayerCount()).toEqual(1);
        expect(data.countText).toEqual("Players in lobby: 1")

        lobby.removePlayer("id1");
        expect(lobby.getPlayerCount()).toEqual(0);
        expect(data.countText).toEqual("Players in lobby: 0")
    })
    it("should track leader", () => {
        let lobby = new Lobby("id");
        let data = lobby.getData();
        let first = "id1";
        let second = "id2";

        lobby.addPlayer(first);
        expect(data.leader).toEqual(first);

        lobby.addPlayer(second);
        expect(data.leader).toEqual(first);

        lobby.removePlayer(first);
        expect(data.leader).toEqual(second);

        lobby.removePlayer(second);
        expect(data.leader).toEqual(second);
    })
})
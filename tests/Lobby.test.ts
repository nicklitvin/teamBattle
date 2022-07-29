import Lobby from "../src/lobby/Lobby";

describe("testing lobby", () => {
    it("should add players", () => {
        let lobby = new Lobby("id");

        lobby.addPlayer("id1");
        expect(lobby.getPlayerCount()).toEqual(1);

        lobby.removePlayer("fake");
        expect(lobby.getPlayerCount()).toEqual(1);

        lobby.removePlayer("id1");
        expect(lobby.getPlayerCount()).toEqual(0);
    })
})
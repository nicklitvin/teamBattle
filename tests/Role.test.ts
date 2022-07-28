import Role from "../src/game/Role"

describe("testing role functions", () => {
    it("should add player to role", () => {
        let role = new Role(1,"x");
        expect(role.getPlayerCount()).toEqual(0);

        role.addPlayer("1");
        expect(role.getPlayerCount()).toEqual(1);
        expect(role.isPlayerHere("1")).toEqual(true);
        expect(role.isFull()).toEqual(true);
    })
    it("should remove player from role", () => {
        let role = new Role(3,"x");
        role.addPlayer("1");
        role.addPlayer("2");
        expect(role.getPlayerCount()).toEqual(2);

        role.removePlayer("1");
        expect(role.getPlayerCount()).toEqual(1);
        expect(role.isPlayerHere("2")).toEqual(true);
        expect(role.isPlayerHere("1")).toEqual(false);
    })
})
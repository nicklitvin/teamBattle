class Lobby {
    constructor() {
        this.socket = io();
        this.setup();
        this.joinLobby();
    }

    joinLobby() {
        var split = window.location.href.split("?");
        for (let txt of split) {
            if (txt.substring(0,2) == "r=") {
                let roomId = txt.split("=")[1];
                this.socket.emit("joinLobby", roomId);
            }
        }
    }

    setup() {
        this.socket.on("setId", (id) => {
            localStorage.setItem("id",id);
            console.log("new ID",id);
        })
    }
}

lobby = new Lobby();
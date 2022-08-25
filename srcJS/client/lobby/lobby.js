class Lobby {
    constructor() {
        this.socket = io();
        this.setup();
        this.joinLobby();
    }

    getRoomId() {
        let split = window.location.href.split("?");

        for (let txt of split) {
            if (txt.substring(0,2) == "r=") {
                let roomId = txt.split("=")[1];
                return roomId;
            }
        }
    }

    joinLobby() {
        let roomId = this.getRoomId();
        let playerId = localStorage.getItem(SocketMessages.localStorageId);
        this.socket.emit(SocketMessages.joinLobby, roomId, playerId);
    }

    updateTitle() {
        let roomId = this.getRoomId();
        let element = document.getElementById("title");
        element.innerHTML = `lobby: ${roomId}`;
    }

    startGame() {
        this.socket.emit(SocketMessages.startGame)
    }

    setup() {
        this.updateTitle();

        this.socket.on(SocketMessages.setId, (id) => {
            localStorage.setItem(SocketMessages.localStorageId,id);
        })
        this.socket.on(SocketMessages.countUpdate, (status) => {
            let element = document.getElementById("lobbyStatus");
            element.innerHTML = status;
        })
        this.socket.on(SocketMessages.lobbyLeaderRole, () => {
            let element = document.getElementById("gameStarter");
            element.style.visibility= "visible";
        })
        this.socket.on(SocketMessages.redirect, (url) => {
            window.location.href = window.location.href.split("lobby")[0] + url;
        })
    }
}
let SocketMessages; 
fetch("../socketMessages.json")
    .then( (res) => res.json())
    .then( (data) => {
        SocketMessages = data;
        const lobby = new Lobby();
        window.lobby = lobby;
    })

window.onpageshow = function(e) {
    if (e.persisted) {
        window.location.reload();
    }
};
import SocketMessages from "../socketMessages.json" assert {type : "json"};

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

        this.socket.on(SocketMessages.setId, (msg) => {
            localStorage.setItem(SocketMessages.localStorageId,msg[0]);
        })
        this.socket.on(SocketMessages.countUpdate, (msg) => {
            let element = document.getElementById("lobbyStatus");
            element.innerHTML = msg[0];
        })
        this.socket.on(SocketMessages.lobbyLeaderRole, () => {
            let element = document.getElementById("gameStarter");
            element.style.visibility= "visible";
        })
        this.socket.on(SocketMessages.redirect, (msg) => {
            window.location.href = SocketMessages.baseUrl + msg[0];
        })
    }
}

const lobby = new Lobby();
window.lobby = lobby;

window.onpageshow = function(e) {
    if (e.persisted) {
        window.location.reload();
    }
};
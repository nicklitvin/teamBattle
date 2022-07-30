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
        console.log("joining");
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
            console.log("new ID",id);
        })
        this.socket.on(SocketMessages.countUpdate, (txt) => {
            let element = document.getElementById("lobbyStatus");
            element.innerHTML = txt;
        })
        this.socket.on(SocketMessages.captainPower, () => {
            let element = document.getElementById("gameStarter");
            element.style.display = "block";
        })
        this.socket.on(SocketMessages.redirect, (url)=>{
            window.location.href = SocketMessages.baseUrl + url;
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
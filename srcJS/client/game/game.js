import SocketMessages from "../socketMessages.json" assert { type: "json" };
import DrawingInstruction from "../DrawingInstruction";
import Drawer from "../Drawer";

class Game {        
    constructor() {
        this.socket = io();
        this.setup();
        this.joinGame();
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

    setup() {
        this.socket.on(SocketMessages.showReturnButton, () => {
            let element = document.getElementById("returnFromGameButton");
            element.style.display = "block";
        })
        this.socket.on(SocketMessages.redirect, (msg) => {
            window.location.href = SocketMessages.baseUrl + msg[0];
        })
        this.socket.on(SocketMessages.gameCountdown, (msg) => {
            let time = msg[0];
        })
        this.socket.on(SocketMessages.gameState, (msg) => {
            let drawInstructions = JSON.parse(msg[0]);
        })
    }

    returnFromGame() {
        this.socket.emit(SocketMessages.playerWantsToReturn);
    }

    joinGame() {
        let roomId = this.getRoomId();
        let playerId = localStorage.getItem(SocketMessages.localStorageId);
        this.socket.emit(SocketMessages.joinGame,playerId,roomId);
    }
}

const game = new Game();
window.game = game;

window.onpageshow = function(e) {
    if (e.persisted) {
        window.location.reload();
    }
};
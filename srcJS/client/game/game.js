import SocketMessages from "../socketMessages.json" assert { type: "json" };
import Drawer from "../Drawer.js"

class Game {        
    constructor() {
        this._socket = io();
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
        let gameCanvas = document.getElementById("game").getContext("2d");
        this._drawer = Drawer(gameCanvas);
        
        this._socket.on(SocketMessages.showReturnButton, () => {
            // let element = document.getElementById("return");
        })
        this._socket.on(SocketMessages.redirect, (msg) => {
            window.location.href = SocketMessages.baseUrl + msg[0];
        })
        this._socket.on(SocketMessages.gameCountdown, (msg) => {
            // let time = msg[0];
        })
        this._socket.on(SocketMessages.gameState, (msg) => {
            let drawInstructions = JSON.parse(msg[0]);
            this._drawer.updateInstructions(drawInstructions);
        })
    }

    returnFromGame() {
        this._socket.emit(SocketMessages.playerWantsToReturn);
    }

    joinGame() {
        let roomId = this.getRoomId();
        let playerId = localStorage.getItem(SocketMessages.localStorageId);
        this._socket.emit(SocketMessages.joinGame,playerId,roomId);
    }

    selectCaptainRole() {
        this._socket.emit(SocketMessages.roleSelectKeyword,SocketMessages.captainTitle);
    }

    selectScoutRole() {
        this._socket.emit(SocketMessages.roleSelectKeyword,SocketMessages.scoutTitle);
    }

    selectShooterRole() {
        this._socket.emit(SocketMessages.roleSelectKeyword,SocketMessages.shooterTitle);
    }

    selectMedicRole() {
        this._socket.emit(SocketMessages.roleSelectKeyword,SocketMessages.medicTitle);
    }

    sendClickCoordinates(e) {
        let bound = game.getBoundingClientRect();
        let x = (e.clientX - bound.x) * (16 / bound.width);
        let y = (bound.height - e.clientY -  bound.y) * (9 / bound.height)

        this._socket.emit(SocketMessages.gameInput,x,y);
    }
}

const game = new Game();
window.game = game;

window.onpageshow = function(e) {
    if (e.persisted) {
        window.location.reload();
    }
};

let gameCanvas = document.getElementById("game");
gameCanvas.addEventListener("click", (e) => {
    game.sendClickCoordinates(e);
})

setInterval( () => {
    game._drawer.draw()
    console.log("drawing");
}, 10);
import SocketMessages from "../socketMessages.json" assert { type: "json" };
import Drawer from "../modules/Drawer.js";

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
        this._drawer = new Drawer();
        
        this._socket.on(SocketMessages.showReturnButton, () => {
            // let element = document.getElementById("return");
        })
        this._socket.on(SocketMessages.redirect, (msg) => {
            window.location.href = SocketMessages.baseUrl + msg[0];
        })
        this._socket.on(SocketMessages.gameCountdown, (msg) => {
            this._gameStartTime = Number(msg[0]);
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
        let x = (e.clientX - bound.x) * (SocketMessages.gameWidth / bound.width);
        let y = (bound.height - e.clientY -  bound.y) * (SocketMessages.gameHeight / bound.height)

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

let drawerId = setInterval( () => {
    let top = document.getElementById("top");
    let topRect = top.getBoundingClientRect();

    // setup gameCanvas
    let gameCanvas = document.getElementById("game");
    let gameCtx = gameCanvas.getContext("2d");
    gameCanvas.width = topRect.width * SocketMessages.gameWidth / SocketMessages.mainDivWidth;
    gameCanvas.height = topRect.height;
    gameCtx.clearRect(0,0,gameCanvas.width,gameCanvas.height);
    gameCtx.fillStyle = "black";
    gameCtx.fillRect(0,0,gameCanvas.width,gameCanvas.height);

    // setup statusCanvas
    let statusCanvas = document.getElementById("status");
    let statusCtx = statusCanvas.getContext("2d");
    let bottom = document.getElementById("bottom");
    let bottomRect = bottom.getBoundingClientRect();

    statusCanvas.width = bottomRect.width * SocketMessages.gameWidth / SocketMessages.mainDivWidth;
    statusCanvas.height = bottomRect.height;
    statusCtx.clearRect(0,0,statusCanvas.width,statusCanvas.height);
    statusCtx.fillStyle = "green";
    statusCtx.fillRect(0,0,statusCanvas.width,statusCanvas.height);

    // draw on gameCanvas
    game._drawer.updateContext(gameCanvas,gameCtx);
    game._drawer.draw()
    let countdown = Math.ceil( (Number(game._gameStartTime) - Date.now()) / 1000);
    if (countdown > 0) {
        game._drawer.drawCountdown(countdown);
    }
    console.log("drawing");
}, 10);

import SocketMessages from "../socketMessages.json" assert { type: "json" };
import Drawer from "./Drawer.js";

class Game {        
    constructor() {
        this._refreshTime = 10;
        this._health = 1;
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
        let gameCanvas = document.getElementById("game");
        gameCanvas.addEventListener("click", (e) => {
            this.sendClickCoordinates(e);
        })

        this._drawer = new Drawer();
        
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
        this._socket.on(SocketMessages.gameShipHealth, (msg) => {
            this._health = msg[0];
        })
        this._socket.on(SocketMessages.gamePermanentMessage, (msg) => {
            this._drawer._permanentMessage = msg[0];
        })
        
        this.draw();
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
        this._socket.emit(SocketMessages.gameInput,SocketMessages.roleSelectKeyword,SocketMessages.captainTitle);
    }

    selectScoutRole() {
        this._socket.emit(SocketMessages.gameInput,SocketMessages.roleSelectKeyword,SocketMessages.scoutTitle);
    }

    selectShooterRole() {
        this._socket.emit(SocketMessages.gameInput,SocketMessages.roleSelectKeyword,SocketMessages.shooterTitle);
    }

    selectMedicRole() {
        this._socket.emit(SocketMessages.gameInput,SocketMessages.roleSelectKeyword,SocketMessages.medicTitle);
    }

    sendClickCoordinates(e) {
        let gameCanvas = document.getElementById("game");
        let bound = gameCanvas.getBoundingClientRect();
        let x = (e.clientX - bound.x) * (SocketMessages.gameWidth / bound.width);
        let y = ( bound.height - (e.clientY -  bound.y) ) * (SocketMessages.gameHeight / bound.height)
        this._socket.emit(SocketMessages.gameInput,x,y);
    }

    draw() {
        let top = document.getElementById("top");
        let topRect = top.getBoundingClientRect();
    
        // setup gameCanvas
        let gameCanvas = document.getElementById("game");
        let gameCtx = gameCanvas.getContext("2d");
        gameCanvas.width = topRect.width * SocketMessages.gameWidth / SocketMessages.mainDivWidth;
        gameCanvas.height = topRect.height;
        gameCtx.clearRect(0,0,gameCanvas.width,gameCanvas.height);
        gameCtx.fillStyle = SocketMessages.gameBackgroundColor;
        gameCtx.fillRect(0,0,gameCanvas.width,gameCanvas.height);
    
        // setup statusCanvas
        let statusCanvas = document.getElementById("status");
        let statusCtx = statusCanvas.getContext("2d");
        let bottom = document.getElementById("bottom");
        let bottomRect = bottom.getBoundingClientRect();
        statusCanvas.width = bottomRect.width * SocketMessages.gameWidth / SocketMessages.mainDivWidth;
        statusCanvas.height = bottomRect.height;

        statusCtx.fillStyle = SocketMessages.gameHealthColor;
        statusCtx.fillRect(0,0,statusCanvas.width * Number(this._health),statusCanvas.height);

        statusCtx.fillStyle = SocketMessages.gameNoHealthColor;
        statusCtx.fillRect(statusCanvas.width * Number(this._health),0,statusCanvas.width,statusCanvas.height);
    
        // draw on gameCanvas
        this._drawer.updateContext(gameCanvas,gameCtx);
        this._drawer.draw()
        let countdown = Math.ceil( (Number(this._gameStartTime) - Date.now()) / 1000);
        if (countdown > 0) {
            this._drawer.writeCountdown(countdown);
        } else if (this._drawer._permanentMessage) {
            this._drawer.writeMessage();
        }

        setTimeout( () => {this.draw()},this._refreshTime);
    }
}

/** reloads page when returning to page to trigger game.setup again */
window.onpageshow = function(e) {
    if (e.persisted) {
        window.location.reload();
    }
};

const game = new Game();
window.game = game;

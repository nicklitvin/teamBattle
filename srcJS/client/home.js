import SocketMessages from "./socketMessages.json" assert { type: "json" };

class ClientLobby {
    constructor() {
        this.socket = io();
        this.setup();
        console.log("setup");
    }

    createLobby(){
        console.log("creating lobby",SocketMessages.createLobby);
        this.socket.emit(SocketMessages.createLobby);
    }

    setup() {
        this.socket.on(SocketMessages.redirect, (url)=>{
            window.location.href += url
        })
    }
}

const lobby = new ClientLobby();
window.lobby = lobby;


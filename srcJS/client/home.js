import SocketMessages from "./socketMessages.json" assert { type: "json" };

class ClientLobby {
    constructor() {
        this.socket = io();
        this.setup();
    }

    createLobby(){
        this.socket.emit(SocketMessages.createLobby);
    }

    setup() {
        this.socket.on(SocketMessages.redirect, (msg)=>{
            window.location.href = SocketMessages.baseUrl + msg[0];
        })
    }
}

const lobby = new ClientLobby();
window.lobby = lobby;

window.onpageshow = function(e) {
    if (e.persisted) {
        window.location.reload();
    }
};
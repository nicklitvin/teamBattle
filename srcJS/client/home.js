class ClientLobby {
    constructor() {
        this.socket = io();
        this.setup();
    }

    createLobby(){
        this.socket.emit(SocketMessages.createLobby);
    }

    setup() {
        this.socket.on(SocketMessages.redirect, (url) => {
            window.location.href = SocketMessages.baseUrl + url;
        })
    }
}

let SocketMessages; 
fetch("./socketMessages.json")
    .then( (res) => res.json())
    .then( (data) => {
        SocketMessages = data;
        const lobby = new ClientLobby();
        window.lobby = lobby;
    })

window.onpageshow = function(e) {
    if (e.persisted) {
        window.location.reload();
    }
};
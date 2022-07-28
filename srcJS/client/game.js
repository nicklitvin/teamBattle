class ClientLobby {
    constructor() {
        this.socket = io();
        this.setup();
    }

    createLobby(){
        this.socket.emit('createLobby')
    }

    setup() {
        this.socket.on('redirect', (url)=>{
            window.location.href += url
        })
    }
}

lobby = new ClientLobby();


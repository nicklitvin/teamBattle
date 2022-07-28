const socket = io();

function createRoom(){
    socket.emit('createRoom')
}

socket.on('redirect', (url)=>{
    window.location.href += url
})
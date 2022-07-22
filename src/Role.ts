export default class Role {
    private title : string;
    private playerIds : string[] = []
    private capacity : number;

    constructor(capacity : number, title : string) {
        this.title = title;
        this.capacity = capacity;
    }

    public isFull() : boolean {
        let yes = this.playerIds.length == this.capacity ? true : false;
        return yes;
    }

    public addPlayer(playerId : string) : void {
        if (!this.isFull()) {
            this.playerIds.push(playerId);
        }
    }

    public removePlayer(playerId : string) : void {
        let index = this.playerIds.indexOf(playerId);
        this.playerIds.splice(index,1);
    }

    public isPlayerHere(playerId : string) : boolean {
        let index = this.playerIds.indexOf(playerId);
        if (index == -1) return false;
        return true;
    }

    public getPlayerCount() {return this.playerIds.length;} 
    public getTitle() : string {return this.title;}
}
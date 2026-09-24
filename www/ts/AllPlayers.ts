import loggingProxy from './utilities/LoggingProxy.ts';

class AllPlayers {
    private lsAllPlayers!: Set<string>;

    private constructor(arrAllPlayers: string[] = []) {
        this.lsAllPlayers = new Set<string>(arrAllPlayers);
    }

    saveAllPlayersToStorage() {
        const json = JSON.stringify(Array.from(this.lsAllPlayers));
        localStorage.setItem("lsAllPlayers", json);
    }

    static fromStorage(): AllPlayers {
        const json = localStorage.getItem("lsAllPlayers");
        const playersArray: string[] = json ? JSON.parse(json) : [];
        return loggingProxy(new AllPlayers(playersArray));
    }

    addPlayer(email: string) {
        if (this.lsAllPlayers.has(email)) {
            this.lsAllPlayers.delete(email);
        }
        this.lsAllPlayers.add(email);
        this.saveAllPlayersToStorage();
    }
    
    getAllPlayers(): string[] {
        return Array.from(this.lsAllPlayers);
    }
}

const allPlayers = AllPlayers.fromStorage();
export default allPlayers;
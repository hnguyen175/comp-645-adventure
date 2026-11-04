import Player from "./Player.ts";
import Party from "./Party.ts";

class GameState {
    constructor(private players: Party | null = null,
        private dktVillain: Player | null = null
    ) { }
    getParty(): Party | null {
        return this.players;
    }
    setParty(players: Party) {
        this.players = players;
    }
}

export default new GameState();
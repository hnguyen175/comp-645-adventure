import Player from "./Player.ts";
import Party from "./Party.ts";

class GameState {
    constructor(private players: Party | null = null,
        private dktVillain: Player | null = null
    ) { }
    getPlayers(): Party | null {
        return this.players;
    }
    setPlayers(players: Party) {
        this.players = players;
    }
    getDtkVillain(): Player | null {
        return this.dktVillain;
    }
    setDtkVillain(villain: Player) {
        this.dktVillain = villain;
    }
}

export default new GameState();
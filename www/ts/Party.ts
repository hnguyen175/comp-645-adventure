import Player from "./Player.ts";
import must from "./utilities/RequiredField.ts";
import ShuffleBag from "./utilities/ShuffleBag.ts";

export default class Party {
    // private key: string;
    currentScreen: string = "DrunkenTavern";
    questCompleted: boolean = false;
    players: Player[];
    private _shuffleBag: ShuffleBag<number> | null = null;

    constructor() {
        this.players = [];
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    addDefaultPlayers() {
        this.players.push(Player.getDefaultPlayer());
        this.players.push(Player.getDefaultPlayer());
    }

    savePlayersToStorage() {
        const json = JSON.stringify(this);
        console.log("Saving players to storage:", json);
        localStorage.setItem(this.players[0]?.email, json);
    }

    public toJSON(): Partial<Party> {
        return {
            currentScreen: this.currentScreen,
            questCompleted: this.questCompleted,
            players: this.players
        };
    }

    static loadPlayersFromStorage(email: string): Party | null {
        const savedPlayers = localStorage.getItem(email);
        if (savedPlayers) {
            return Party.fromJSON(JSON.parse(savedPlayers));
        }
        return null;
    }

    private static fromJSON(data: Partial<Party>): Party {
        const players = Object.assign(new Party(), data);

        players.players = data.players?.map(
            playerData => Player.fromJSON(playerData)) || [];
        return players;
    }

    toString(): string {
        return `Players: ${this.players.map(player => player.toString()).join(", ")}`;
    }

    // does not handle the case where new players are added after the shuffle bag is created. In that case, the shuffle bag will need to be reset.
    randomPlayerPicker(): Player {
        must(this.players.length > 0, "No players available to pick from.");

        if (!this._shuffleBag) {
            const randomRange = Array.from({ length: this.players.length }, (_, i) => i);
            this._shuffleBag = new ShuffleBag(randomRange);
        }
        const randomIndex = this._shuffleBag.getRandomItem();
        return this.players[randomIndex];
    }
};
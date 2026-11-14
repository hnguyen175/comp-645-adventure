import Player from "./Player.ts";
import must from "./utilities/RequiredField.ts";
import ShuffleBag from "./utilities/ShuffleBag.ts";

export type Grade = "A" | "B" | "C" | "F";

export default class Party {
    // private key: string;
    currentScreen: string = "DrunkenTavern";
    questCompleted: boolean = false;
    players: Player[];
    private _earnedGold: number = 0;
    private _shuffleBag: ShuffleBag<number> | null = null;
    private _inventory: string = "";
    private _escapeTimer: number = 0;

    constructor() {
        this.players = [];
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    addDefaultPlayers() {
        this.players.push(new Player());
        this.players.push(new Player());
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
            players: this.players,
            earnedGold: this._earnedGold,
            inventory: this._inventory,
            escapeTimer: this._escapeTimer,
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
        const party = Object.assign(new Party(), data);

        party.players = data.players?.map(
            playerData => Player.fromJSON(JSON.parse(JSON.stringify(playerData)))) || [];
        return party;
    }

    toString(): string {
        return `Players: ${this.players.map(player => player.toString()).join(", ")}`;
    }

    // does not handle the case where new players are added after the shuffle bag is created. In that case, the shuffle bag will need to be reset.
    draw(): Player {
        must(this.players.length > 0, "No players available to pick from.");

        if (!this._shuffleBag) {
            const randomRange = Array.from({ length: this.players.length }, (_, i) => i);
            this._shuffleBag = new ShuffleBag(randomRange);
        }
        const randomIndex = this._shuffleBag.draw();
        return this.players[randomIndex];
    }

    get earnedGold(): number {
        return this._earnedGold;
    }

    set earnedGold(value: number) {
        this._earnedGold = value;
    }

    addGold(value: number): number {
        this._earnedGold += value;
        return this._earnedGold;
    }

    averageLuk(): number {
        if (this.players.length === 0) return 0;
        const totalLuk = this.players.reduce((sum, player) => sum + player.luk, 0);
        return Math.round(totalLuk / this.players.length);
    }

    get inventory(): string {
        return this._inventory;
    }

    set inventory(value: string) {
        this._inventory = value;
    }

    get escapeTimer(): number {
        return this._escapeTimer;
    }

    set escapeTimer(value: number) {
        this._escapeTimer = value;
    }

    calculateFinalScore(): Grade {

        // Determine the grade based on the final score
        if (this.escapeTimer >= 9) {
            return "A";
        } else if (this.escapeTimer >= 3) {
            return "B";
        } else if (this._escapeTimer > 0) {
            return "C";
        } else {
            return "F";
        }
    }
};
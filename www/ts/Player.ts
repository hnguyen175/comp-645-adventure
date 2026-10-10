import ShuffleBag from "./utilities/ShuffleBag.ts";

type PlayerStats = {
    hp: number;
    str: number;
    spd: number;
    mp: number;
    luk: number;
    wep: string;
    cls: string;
};

export default class Player {
    private _name: string;
    private _email: string;
    hp: number = 0;
    str: number = 0;
    spd: number = 0;
    mp: number = 0;
    luk: number = 0;
    wep: string = "";
    cls: string = "";
    private _id: string = crypto.randomUUID();

    get name(): string {
        return this._name;
    }

    get email(): string {
        return this._email;
    }

    get id(): string {
        return this._id;
    }

    static arrNames = ["Abakor", "Bandala", "Cartin", "Darianne", "Fezzor", "Gizleeni", "Halor", "Ia", "Jeepenn", "Kalindaa", "Lineuss", "Mordana", "Nazzor", "Ortery", "Parto", "Quey", "Rato", "Salana", "Torqq", "Uvala", "Vixtor", "Wylia", "Xex", "Yala", "Zetch"] as const;
    static arrVillainNames = ["Azrath", "Belnox", "Craven", "Dravora", "Ezrakk", "Grizmor", "Hexar", "Ivara", "Jorvex", "Kharza", "Maldrin", "Nyxara", "Ozrak", "Raveth", "Skarro", "Thyra", "Vorren", "Xandrak", "Zerith", "Morvane", "Drexil", "Valgora", "Krynn", "Noctra", "Zalthor"] as const;
    static arrWeapons = ["Rocks", "Staff", "Dagger", "Mace", "Warhammer", "Sword", "Battle Axe"] as const;
    static arrClasses = ["Healer", "Warrior", "Thief", "Knight", "Damsel", "Warlock", "Farmer"] as const;
    static arrLukProbability = [.02, .1, .2, 1] as const;


    static randomStat(): number {
        return (Math.floor(Math.random() * 4) + 1) * 25;
    };

    static randomMp(): number {
        return (Math.floor(Math.random() * 10) + 1) * 10;
    }

    static randomLuk(): number {
        const randomValue = Math.random();
        const lukIndex = this.arrLukProbability.findIndex(probability => randomValue <= probability);
        switch (lukIndex) {
            case 0:
                return 10;
            case 1:
                return 3;
            case 2:
                return 2;
            default:
                return 1;
        }
    }

    static randomString(arr: readonly string[]): string {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    }

    private static namePool = new ShuffleBag(Player.arrNames);
    private static villainNamePool = new ShuffleBag(Player.arrVillainNames);

    static randomWeapon(): string {
        return Player.randomString(Player.arrWeapons);
    }

    static randomClass(): string {
        return Player.randomString(Player.arrClasses);
    }

    constructor(name: string = "", email: string = "") {
        this._name = name;
        this._email = email;
    }

    static createRandomPlayer(name: string = "", email: string = ""): Player {
        const player = new Player(name, email);
        Object.assign(player, Player.randomStats());
        return player;
    }

    private static randomStats(): PlayerStats {
        return {
            hp: Player.randomStat(),
            spd: Player.randomStat(),
            str: Player.randomStat(),
            mp: Player.randomMp(),
            luk: Player.randomLuk(),
            wep: Player.randomWeapon(),
            cls: Player.randomClass(),
        };
    }

    public static getDefaultPlayer(): Player {
        const randomName = Player.namePool.getRandomItem();
        return Player.createRandomPlayer(randomName, `${randomName.toLowerCase()}@comp645.com`);
    }

    public static getVillainPlayer(): Player {
        const randomVillainName = Player.villainNamePool.getRandomItem();
        return Player.createRandomPlayer(randomVillainName, `${randomVillainName.toLowerCase()}@comp645.com`);
    }

    static fromJSON(data: Partial<Player>): Player {
        return Object.assign(new Player(), data);
    }

    toString(): string {
        return `Player: ${this._name}, Email: ${this._email}, HP: ${this.hp}, STR: ${this.str}, SPD: ${this.spd}, MP: ${this.mp}, LUK: ${this.luk}, WEP: ${this.wep}, CLS: ${this.cls}`;
    }
}
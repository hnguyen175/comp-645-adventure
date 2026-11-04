import RandomGenerator from "./utilities/RandomGenerator.ts";

export type PlayerStats = {
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
    private _id: string;

    get name(): string {
        return this._name;
    }

    get email(): string {
        return this._email;
    }

    get id(): string {
        return this._id;
    }

    constructor(name: string | null = null, email: string | null = null, id: string | null = null, playerStats: PlayerStats | null = null) {
        this._name = (name ?? RandomGenerator.randomName());
        this._email = (email ?? this._name.toLowerCase() + "@comp645.com");
        this._id = (id ?? crypto.randomUUID());
        if (playerStats) {
            Object.assign(this, playerStats);
        } else {
            this.hp = RandomGenerator.playerRandomStat();
            this.spd = RandomGenerator.playerRandomStat();
            this.str = RandomGenerator.playerRandomStat();
            this.mp = RandomGenerator.playerRandomStat();
            this.luk = RandomGenerator.randomLuk();
            this.wep = RandomGenerator.randomWeapon();
            this.cls = RandomGenerator.randomClass();
        }
    }

    public static getVillainPlayer(): Player {
        const randomVillainName = RandomGenerator.randomVillainName();
        return new Player(randomVillainName, `${randomVillainName.toLowerCase()}@comp645.com`);
    }

    static fromJSON(data: Partial<Player> & { _name?: string; _email?: string; _id?: string; }): Player {
        const player = new Player(data._name! ?? null, data._email ?? null, data._id ?? null, {
            hp: data.hp ?? 0,
            str: data.str ?? 0,
            spd: data.spd ?? 0,
            mp: data.mp ?? 0,
            luk: data.luk ?? 0,
            wep: data.wep ?? "",
            cls: data.cls ?? ""
        });
        return player;
    }

    toString(): string {
        return JSON.stringify(this);
    }
}

type PlayerStats = {
    hp: number;
    speed: number;
    strength: number;
    mp: number;
    luk: number;
    weapon: string;
    cls: string;
};

export default class Player {
    name: string;
    email: string;
    hp: number = 0;
    speed: number = 0;
    strength: number = 0;
    mp: number = 0;
    luk: number = 0;
    weapon: string = "";
    cls: string = "";
    static arrNames = ["Abakor", "Bandala", "Cartin", "Darianne", "Fezzor", "Gizleeni", "Halor", "Ia", "Jeepenn", "Kalindaa", "Lineuss", "Mordana", "Nazzor", "Ortery", "Parto", "Quey", "Rato", "Salana", "Torqq", "Uvala", "Vixtor", "Wylia", "Xex", "Yala", "Zetch"] as const;
    static arrWeapons = ["Rocks", "Staff", "Dagger", "Mace", "Warhammer", "Sword", "Battle Axe"] as const;
    static arrClasses = ["Healer", "Warrior", "Thief", "Knight", "Damsel", "Warlock", "Farmer"] as const;
    static arrLukProbability = [.02, .1, .2, 1] as const;


    static randomStat() : number  {
        return (Math.floor(Math.random() * 4) + 1) * 25;
    };

    static randomMp() : number  {
        return (Math.floor(Math.random() * 10) + 1) * 10;
    }

    static randomLuk() : number  {
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

    static randomString(arr: readonly string[]) : string  {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    }

    static randomName() : string  {
        return Player.randomString(Player.arrNames);
    }

    static randomWeapon() : string  {
        return Player.randomString(Player.arrWeapons);
    }

    static randomClass() : string  {
        return Player.randomString(Player.arrClasses);
    }

    constructor(name: string, email: string) {
        this.name = name;
        this.email = email;
        Object.assign(this, Player.randomStats());
    }

    private static randomStats() : PlayerStats {
        return {
            hp: Player.randomStat(),
            speed: Player.randomStat(),
            strength: Player.randomStat(),
            mp: Player.randomMp(),
            luk: Player.randomLuk(),
            weapon: Player.randomWeapon(),
            cls: Player.randomClass(),
        };
    }

    public static getDefaultPlayer() : Player{
        return new Player(Player.randomName(), `${Player.randomName().toLowerCase()}@comp645.com`);
    }

    static load() : Player | null {
        const saved = sessionStorage.getItem("player");
        if(saved){
            const player = JSON.parse(saved);
            return player;
        }
        return null;
    }

    save() {
        sessionStorage.setItem("player", JSON.stringify(this));
    }

    static samePlayer(name: string, email: string, other: Player) : boolean {
        return name === other.name && email === other.email;
    }
}
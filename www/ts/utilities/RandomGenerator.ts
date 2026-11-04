import ShuffleBag from "./ShuffleBag.ts";

export default class RandomGenerator {
    static readonly arrStats = [10, 25, 50, 75, 100];
    static readonly arrVillainStats = [20, 50, 100, 150, 200];

    static randomArrayValue(arr: number[]): number {
        const randomValue = Math.floor(Math.random() * arr.length);
        return arr[randomValue];
    }

    static playerRandomStat(): number {
        return RandomGenerator.randomArrayValue(RandomGenerator.arrStats);
    }

    static villainRandomStat(): number {
        return RandomGenerator.randomArrayValue(RandomGenerator.arrVillainStats);
    }

    private static readonly arrLukProbability = [.02, .1, .2, 1] as const;
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

    static arrWeapons = new ShuffleBag(["Rocks", "Staff", "Dagger", "Mace", "Warhammer", "Sword", "Battle Axe"] as const);
    static arrClasses = new ShuffleBag(["Healer", "Warrior", "Thief", "Knight", "Damsel", "Warlock", "Farmer"] as const);

    static randomWeapon(): string {
        return this.arrWeapons.draw();
    }

    static randomClass(): string {
        return this.arrClasses.draw();
    }

    static arrNames = new ShuffleBag(["Abakor", "Bandala", "Cartin", "Darianne", "Fezzor", "Gizleeni", "Halor", "Ia", "Jeepenn", "Kalindaa", "Lineuss", "Mordana", "Nazzor", "Ortery", "Parto", "Quey", "Rato", "Salana", "Torqq", "Uvala", "Vixtor", "Wylia", "Xex", "Yala", "Zetch"] as const);
    static arrVillainNames = new ShuffleBag(["Azrath", "Belnox", "Craven", "Dravora", "Ezrakk", "Grizmor", "Hexar", "Ivara", "Jorvex", "Kharza", "Maldrin", "Nyxara", "Ozrak", "Raveth", "Skarro", "Thyra", "Vorren", "Xandrak", "Zerith", "Morvane", "Drexil", "Valgora", "Krynn", "Noctra", "Zalthor"] as const);

    static randomName(): string {
        return this.arrNames.draw();
    }
    static randomVillainName(): string {
        return this.arrVillainNames.draw();
    }

    static randomStat(min: number = 0, max: number = 100, increment: number = 25): number {
        const lower = Math.max(1, Math.ceil(min / increment));
        const upper = Math.floor(max / increment);

        if (lower > upper) {
            throw new RangeError(`No valid multiple of ${increment} in range`);
        }

        return (Math.floor(Math.random() * (upper - lower + 1)) + lower) * increment;
    }
}

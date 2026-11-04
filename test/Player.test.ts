import * as Vitest from 'vitest';
import Player from '../www/ts/Player';
import RandomGenerator from '../www/ts/utilities/RandomGenerator';

Vitest.beforeEach(() => {
    localStorage.clear();
});

Vitest.afterEach(() => {
    Vitest.vi.restoreAllMocks();
});

Vitest.test("0 strength", () => {
    const player = new Player("John Doe", "a@b.c");
    Vitest.expect(player.email).toBe("a@b.c");
    Vitest.expect(player.name).toBe("John Doe");

    Vitest.expect(player.str).toBeGreaterThan(0)
    Vitest.expect(player.str).toBeLessThanOrEqual(100);
    Vitest.expect(player.hp).toBeGreaterThan(0);
    Vitest.expect(player.hp).toBeLessThanOrEqual(100);
    Vitest.expect(player.spd).toBeGreaterThan(0);
    Vitest.expect(player.spd).toBeLessThanOrEqual(100);
    Vitest.expect(player.mp).toBeGreaterThan(0);
    Vitest.expect(player.mp).toBeLessThanOrEqual(100);
    Vitest.expect(player.luk).toBeGreaterThan(0);
    Vitest.expect(player.luk).toBeLessThanOrEqual(10);
    Vitest.expect(RandomGenerator.arrWeapons.contains(player.wep)).toBe(true);
    Vitest.expect(RandomGenerator.arrClasses.contains(player.cls)).toBe(true);
});

Vitest.test("randomizeStrength returns a number between 10 and 100", () => {
    let twentyFiveStrengths = 0;
    let fiftyStrengths = 0;
    let seventyFiveStrengths = 0;
    let hundredStrengths = 0;
    let tenStrengths = 0;

    for (let i = 0; i < 100; i++) {
        const player = new Player("John Doe", "a@b.c");
        const strength = player.str;

        Vitest.expect(RandomGenerator.arrStats.find(stat => stat === strength)).toBeDefined();
        switch (strength) {
            case 10:
                tenStrengths++;
                break;
            case 25:
                twentyFiveStrengths++;
                break;
            case 50:
                fiftyStrengths++;
                break;
            case 75:
                seventyFiveStrengths++;
                break;
            case 100:
                hundredStrengths++;
                break;
            default:
                throw new Error(`Unexpected strength value: ${strength}`);
        }
    }

    Vitest.expect(tenStrengths).toBeGreaterThan(0);
    Vitest.expect(twentyFiveStrengths).toBeGreaterThan(0);
    Vitest.expect(fiftyStrengths).toBeGreaterThan(0);
    Vitest.expect(seventyFiveStrengths).toBeGreaterThan(0);
    Vitest.expect(hundredStrengths).toBeGreaterThan(0);
});

Vitest.describe.each(["str", "hp", "spd", "mp"] as const)("Player.%s", (property) => {
    Vitest.test.each([
        [0.11, 10],
        [0.251, 25],
        [0.45, 50],
        [0.61, 75],
        [0.851, 100],
    ] as const)("randomizeStrength returns %i when Math.random() returns %f", (mockReturnValue, expectedStrength) => {
        Vitest.vi.spyOn(Math, 'random').mockReturnValue(mockReturnValue);
        const player = new Player();
        Vitest.expect(player[property]).toBe(expectedStrength);
        Vitest.expect(player.email).toBeDefined();
        Vitest.expect(RandomGenerator.arrNames.contains(player.name)).toBe(true);
        Vitest.expect(RandomGenerator.arrWeapons.contains(player.wep)).toBe(true);
        Vitest.expect(RandomGenerator.arrClasses.contains(player.cls)).toBe(true);
    });
});

Vitest.test.each([
    [0, 10],
    [0.01, 10],
    [0.019, 10],
    [0.02, 10],
    [0.021, 3],
    [0.03, 3],
    [0.08, 3],
    [0.1, 3],
    [0.19, 2],
    [0.2, 2],
    [0.21, 1],
    [0.79, 1],
    [0.8, 1],
    [1, 1],
])("randomizeLuk returns %d when Math.random() returns %f", (mockReturnValue, expectedLuk) => {
    Vitest.vi.spyOn(Math, 'random').mockReturnValue(mockReturnValue);
    const luk = RandomGenerator.randomLuk();
    Vitest.expect(luk).toBe(expectedLuk);
});

Vitest.test.each([
    [0, 100],
    [10, 30],
    [50, 75],
] as const)("randomStat returns a number between %i and %i", (min, max) => {
    for (let i = 0; i < 1000; i++) {
        const stat = RandomGenerator.randomStat(min, max);

        Vitest.expect(stat).toBeGreaterThanOrEqual(min);
        Vitest.expect(stat).toBeLessThanOrEqual(max);
        Vitest.expect(stat).toBeGreaterThan(0);
        Vitest.expect(stat % 25).toBe(0);
    }
});

Vitest.test.each([
    [0, 100, 10, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]],
    [10, 30, 10, [10, 20, 30]],
    [50, 75, 10, [50, 60, 70]],
    [1, 21, 10, [10, 20]],
    [21, 25, 10, []],
] as const)("randomStat with increment returns a number between %i and %i", (min, max, increment, expectedValues) => {
    for (let i = 0; i < 1000; i++) {
        if (expectedValues.length === 0) {
            Vitest.expect(() => RandomGenerator.randomStat(min, max, increment)).toThrow(RangeError);
            return;
        }

        const stat = RandomGenerator.randomStat(min, max, increment);
        Vitest.expect(expectedValues).toContain(stat);

        Vitest.expect(stat).toBeGreaterThanOrEqual(min);
        Vitest.expect(stat).toBeLessThanOrEqual(max);
        Vitest.expect(stat).toBeGreaterThan(0);
        Vitest.expect(stat % increment).toBe(0);
    }
});

Vitest.test("randomStat with max less than min throws an error", () => {
    Vitest.expect(() => RandomGenerator.randomStat(100, 50)).toThrow("No valid multiple of 25 in range");
});

Vitest.test("getVillainPlayer returns a Player with a name from arrVillainNames", () => {
    const villainPlayer = Player.getVillainPlayer();
    Vitest.expect(RandomGenerator.arrVillainNames.contains(villainPlayer.name)).toBe(true);
    Vitest.expect(villainPlayer.email).toBe(`${villainPlayer.name.toLowerCase()}@comp645.com`);
});

Vitest.test("fromJSON creates player from its toString representation", () => {
    const player = new Player();
    const playerString = player.toString();
    const playerFromString = Player.fromJSON(JSON.parse(playerString));
    Vitest.expect(playerFromString.name).toBe(player.name);
    Vitest.expect(playerFromString.email).toBe(player.email);
    Vitest.expect(playerFromString.id).toBe(player.id);
    Vitest.expect(playerFromString.hp).toBe(player.hp);
    Vitest.expect(playerFromString.str).toBe(player.str);
    Vitest.expect(playerFromString.spd).toBe(player.spd);
    Vitest.expect(playerFromString.mp).toBe(player.mp);
    Vitest.expect(playerFromString.luk).toBe(player.luk);
    Vitest.expect(playerFromString.wep).toBe(player.wep);
    Vitest.expect(playerFromString.cls).toBe(player.cls);
});

Vitest.test("fromJSON creates a Player instance with default values when properties are missing", () => {
    const json = {
    };
    const player = Player.fromJSON(json);
    Vitest.expect(player.name).toBeDefined();
    Vitest.expect(player.email).toBeDefined();
    Vitest.expect(player.id).toBeDefined();
    Vitest.expect(player.hp).toBe(0);
    Vitest.expect(player.str).toBe(0);
    Vitest.expect(player.spd).toBe(0);
    Vitest.expect(player.mp).toBe(0);
    Vitest.expect(player.luk).toBe(0);
    Vitest.expect(player.wep).toBe("");
    Vitest.expect(player.cls).toBe("");
});
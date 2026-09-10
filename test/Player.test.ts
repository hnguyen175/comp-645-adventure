// @vitest-environment jsdom

import * as Vitest from 'vitest';
import Player from '../www/ts/Player';

Vitest.beforeEach(() => {
    sessionStorage.clear();
});

Vitest.afterEach(() => {
    Vitest.vi.restoreAllMocks();
});

Vitest.test("0 strength", () => {
    const player = new Player("John Doe", "a@b.c");
    Vitest.expect(player.email).toBe("a@b.c");
    Vitest.expect(player.name).toBe("John Doe");

    Vitest.expect(player.strength).toBeGreaterThan(0)
    Vitest.expect(player.strength).toBeLessThanOrEqual(100);
    Vitest.expect(player.hp).toBeGreaterThan(0);
    Vitest.expect(player.hp).toBeLessThanOrEqual(100);
    Vitest.expect(player.speed).toBeGreaterThan(0);
    Vitest.expect(player.speed).toBeLessThanOrEqual(100);
    Vitest.expect(player.mp).toBeGreaterThan(0);
    Vitest.expect(player.mp).toBeLessThanOrEqual(100);
    Vitest.expect(player.luk).toBeGreaterThan(0);
    Vitest.expect(player.luk).toBeLessThanOrEqual(10);
    Vitest.expect(Player.arrWeapons).contains(player.weapon);
    Vitest.expect(Player.arrClasses).contains(player.cls);
});

Vitest.test("randomizeStrength returns a number between 25 and 100", () => {
    let twentyFiveStrengths = 0;
    let fiftyStrengths = 0;
    let seventyFiveStrengths = 0;
    let hundredStrengths = 0;

    for (let i = 0; i < 100; i++) {
        const player = new Player("John Doe", "a@b.c");
        const strength = player.strength;

        Vitest.expect(strength).toBeGreaterThanOrEqual(25);
        Vitest.expect(strength).toBeLessThanOrEqual(100);
        if (strength === 25) {
            twentyFiveStrengths++;
        } else if (strength === 50) {
            fiftyStrengths++;
        } else if (strength === 75) {
            seventyFiveStrengths++;
        } else if (strength === 100) {
            hundredStrengths++;
        }
    }

    Vitest.expect(twentyFiveStrengths).toBeGreaterThan(0);
    Vitest.expect(fiftyStrengths).toBeGreaterThan(0);
    Vitest.expect(seventyFiveStrengths).toBeGreaterThan(0);
    Vitest.expect(hundredStrengths).toBeGreaterThan(0);
});

Vitest.describe.each(["strength", "hp", "speed"] as const)("Player.%s", (property) => {
    Vitest.test.each([
        [0.11, 25],
        [0.251, 50],
        [0.51, 75],
        [0.751, 100],
    ] as const)("randomizeStrength returns %i when Math.random() returns %f", (mockReturnValue, expectedStrength) => {
        Vitest.vi.spyOn(Math, 'random').mockReturnValue(mockReturnValue);
        const player = Player.getDefaultPlayer();
        Vitest.expect(player[property]).toBe(expectedStrength);
        Vitest.expect(player.email).toBeDefined();
        Vitest.expect(Player.arrNames).toContain(player.name);
        Vitest.expect(Player.arrWeapons).toContain(player.weapon);
        Vitest.expect(Player.arrClasses).toContain(player.cls);
    });
});

Vitest.test.each([
    [0.01, 10],
    [0.11, 20],
    [0.21, 30],
    [0.51, 60],
    [0.71, 80],
] as const)("randomizeMp returns %i when Math.random() returns %f", (mockReturnValue, expectedMp) => {
    Vitest.vi.spyOn(Math, 'random').mockReturnValue(mockReturnValue);
    const player = new Player("John Doe", "a@b.c");
    Vitest.expect(player.mp).toBe(expectedMp);
});

Vitest.test("save and load player", () => {
    const player = Player.getDefaultPlayer();
    player.save();
    const loadedPlayer = Player.load();
    Vitest.expect(loadedPlayer).toEqual(player);
});

Vitest.test("load returns null when no player is saved", () => {
    const loadedPlayer = Player.load();
    Vitest.expect(loadedPlayer).toBeNull();
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
    const luk = Player.randomLuk();
    Vitest.expect(luk).toBe(expectedLuk);
});

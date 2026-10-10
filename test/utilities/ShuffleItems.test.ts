import * as Vitest from "vitest";
import ShuffleBag from "../../www/ts/utilities/ShuffleBag";

Vitest.test("ShuffleBag should return a random item from the provided array", () => {
    const items = [1, 2, 3, 4, 5];
    const picker = new ShuffleBag(items);
    let pickedItems: number[] = [];
    for (let i = 0; i < items.length; i++) {
        const randomItem = picker.getRandomItem();
        pickedItems.push(randomItem);
    }

    Vitest.expect(items.every(item => pickedItems.includes(item))).toBe(true);

    // able to pick more items than the original array length, and it should still return items from the original array
    Vitest.expect(items.includes(picker.getRandomItem())).toBe(true);
});

Vitest.test("ShuffleBag should not return the same item consecutively when there are at least 2 unique items", () => {
    const items = [1, 2];
    const picker = new ShuffleBag(items);
    let lastPickedItem: number | null = null;
    for (let i = 0; i < 10; i++) {
        const randomItem = picker.getRandomItem();
        Vitest.expect(randomItem).not.toBe(lastPickedItem);
        lastPickedItem = randomItem;
    }
});
import must from "./RequiredField.ts";

export default class ShuffleBag<T> {
    private items: T[];
    private lastPickedItem: T | null = null;

    constructor(private originalItems: readonly T[]) {
        this.originalItems = [...new Set(originalItems)];
        must(this.originalItems.length > 0, "The originalItems array must contain at least one item.");

        this.items = ShuffleBag.shuffleItems(this.originalItems);
    }

    private static shuffleItems<T>(items: readonly T[]): T[] {
        const shuffled = [...items];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }


    // Guarantees no consecutive duplicate picks
    // when originalItems contains at least 2 unique items.
    public getRandomItem(): T {
        let pickedItem: T;
        if (this.items.length === 0) {
            this.items = ShuffleBag.shuffleItems(this.originalItems);
            pickedItem = this.items.pop()!;
            if (pickedItem === this.lastPickedItem && this.items.length > 0) {
                this.items.unshift(pickedItem);
                pickedItem = this.items.pop()!;
            }
        } else {
            pickedItem = this.items.pop()!;
        }

        this.lastPickedItem = pickedItem;

        return pickedItem;
    }
}
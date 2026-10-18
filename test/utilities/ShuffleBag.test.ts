import * as Vitest from 'vitest';
import ShuffleBag from '../../www/ts/utilities/ShuffleBag';

Vitest.test("ShuffleBag should shuffle items correctly", () => {
    const shuffleBag = new ShuffleBag([1, 2]);
    const item1 = shuffleBag.draw();
    const item2 = shuffleBag.draw();

    Vitest.expect(item1).not.toBe(item2);

    const item3 = shuffleBag.draw();

    Vitest.expect([1, 2]).toContain(item3);
    Vitest.expect([1, 2]).toContain(item1);
    Vitest.expect([1, 2]).toContain(item2);
});
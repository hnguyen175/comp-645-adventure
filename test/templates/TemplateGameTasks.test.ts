import * as Vitest from 'vitest';
import must from '../../www/ts/utilities/RequiredField';
import NavController from '../../www/ts/NavController';
import TemplateGameTasks from '../../www/ts/templates/TemplateGameTasks';

let navControllerMock: any;
Vitest.beforeAll(() => {
    navControllerMock = {
        resetCarouselToWelcome: Vitest.vi.fn().mockResolvedValue(undefined),
        resetCarouselToLoadGame: Vitest.vi.fn().mockResolvedValue(undefined),
    };
});

Vitest.beforeEach(() => {
    Vitest.vi.clearAllMocks();
});

Vitest.test('TemplateGameTask should be properly initialized', async () => {
    document.body.innerHTML = /*html*/ `
        <html>
            <template id="templ8GameTasks">
                <div class="game-tasks">
                    <h3>Game Task</h3>
                    <p>This is a game task.</p>
                </div>
            </template>
        </html>`;

    const templateGameTasks = new TemplateGameTasks(navControllerMock as NavController);
    Vitest.expect(templateGameTasks).not.toBeNull();
    Vitest.expect(templateGameTasks.templateFragment).not.toBeNull();
});

Vitest.test('TemplateGameTask should not call resetCarouselToWelcome for non-quit actions', async () => {
    document.body.innerHTML = /*html*/ `
        <html>
            <template id="templ8GameTasks">
                <div class="game-tasks">
                    <h3>Game Task</h3>
                    <p>This is a game task.</p>
                    <a href="#" data-gametsk='duh'>Click me</a>
                </div>
            </template>
        </html>`;

    const templateGameTasks = new TemplateGameTasks(navControllerMock as NavController);
    Vitest.expect(templateGameTasks).not.toBeNull();
    Vitest.expect(templateGameTasks.templateFragment).not.toBeNull();

    document.body.appendChild(templateGameTasks.templateFragment);

    const gameTaskLink = must(document.querySelector<HTMLAnchorElement>('a[data-gametsk]'));

    gameTaskLink.click();

    await Vitest.vi.waitFor(() => {
        Vitest.expect(navControllerMock.resetCarouselToWelcome).not.toHaveBeenCalled();
    });
});

Vitest.test('TemplateGameTask should handle click events on game task links', async () => {
    document.body.innerHTML = /*html*/ `
        <html>
            <template id="templ8GameTasks">
                <div class="game-tasks">
                    <h3>Game Task</h3>
                    <p>This is a game task.</p>
                    <a href="#" data-gametsk='quit'>Click me</a>
                    <a href="#" data-gametsk='load'>Click me</a>
                </div>
            </template>
        </html>`;

    const templateGameTasks = new TemplateGameTasks(navControllerMock as NavController);
    Vitest.expect(templateGameTasks).not.toBeNull();
    Vitest.expect(templateGameTasks.templateFragment).not.toBeNull();

    document.body.appendChild(templateGameTasks.templateFragment);

    const gameQuitLink = must(document.querySelector<HTMLAnchorElement>('a[data-gametsk="quit"]'));
    gameQuitLink.click();
    await Vitest.vi.waitFor(() => {
        Vitest.expect(navControllerMock.resetCarouselToWelcome).toHaveBeenCalled();
    });

    const gameLoadLink = must(document.querySelector<HTMLAnchorElement>('a[data-gametsk="load"]'));
    gameLoadLink.click();
    await Vitest.vi.waitFor(() => {
        Vitest.expect(navControllerMock.resetCarouselToLoadGame).toHaveBeenCalled();
    });
});
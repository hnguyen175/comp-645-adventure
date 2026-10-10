import must from "../utilities/RequiredField.ts";
import NavController from "../NavController.ts";
import { fireAndForget } from "../utilities/AsyncUtils.ts";

export default class TemplateGameTasks {
    private _template: HTMLTemplateElement | null = null;

    constructor(private _navController: NavController) {
        this.initializePage();
    }

    initializePage(): void {
        this._template = must(document.querySelector<HTMLTemplateElement>("#templ8GameTasks"));
    }

    get templateFragment(): DocumentFragment {
        const fragment = must(this._template).content.cloneNode(true) as DocumentFragment;
        const gameTasks = must(fragment.querySelector<HTMLElement>(".game-tasks"));
        this.registerGameTaskEvents(gameTasks);
        return fragment;
    }

    private registerGameTaskEvents(gameTasks: HTMLElement) {
        gameTasks.addEventListener("click", (event) => {
            const clickedElement = must((<HTMLElement>event.target).closest('a[data-gametsk]'));

            const action = must(clickedElement.getAttribute('data-gametsk'));
            console.log(`template game tasks: ${action} clicked.`);
            if (action === "quit") {
                fireAndForget(
                    this._navController.resetCarouselToWelcome()
                );
                return;
            }
            if (action === "load") {
                fireAndForget(
                    this._navController.resetCarouselToLoadGame()
                );
                return;
            }
        });
    }
}
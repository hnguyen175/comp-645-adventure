import must from "../utilities/RequiredField.ts";
import NavController from "../NavController.ts";
import { fireAndForget } from "../utilities/AsyncUtils.ts";

class GameTasks {
  private _fragment: DocumentFragment | null = null;
  private static _instance: GameTasks | null = null;

  private constructor(private _navController: NavController) {}

  static initialize(navController: NavController) {
    GameTasks._instance ??= new GameTasks(navController);
  }

  static get instance(): GameTasks {
    return must(GameTasks._instance);
  }

  get templateFragment(): DocumentFragment {
    this._fragment ??= must(
      document.querySelector<HTMLTemplateElement>("#templGameTasks"),
    ).content;

    const fragment = this._fragment.cloneNode(true) as DocumentFragment;
    const gameTasks = must(fragment.querySelector<HTMLElement>(".game-tasks"));
    this.registerGameTaskEvents(gameTasks);
    return fragment;
  }

  private registerGameTaskEvents(gameTasks: HTMLElement) {
    gameTasks.addEventListener("click", (event) => {
      const clickedElement = must(
        (<HTMLElement>event.target).closest("a[data-gametsk]"),
      );

      const action = must(clickedElement.getAttribute("data-gametsk"));
      console.log(`template game tasks: ${action} clicked.`);
      if (action === "quit") {
        fireAndForget(this._navController.resetCarouselToWelcome());
        return;
      }
      if (action === "load") {
        fireAndForget(this._navController.resetCarouselToLoadGame());
        return;
      }
    });
  }
}

export default GameTasks;

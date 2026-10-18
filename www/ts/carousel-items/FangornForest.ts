import TemplateGameTasks from "../templates/TemplateGameTasks.ts";
import CarouselItem from "./CarouselItem.ts";
import must from "../utilities/RequiredField.ts";
import currentGameState from "../GameState.ts";
import loggingProxy from "../utilities/LoggingProxy.ts";
import PlayerView from "../rendering/PlayerView.ts";
import ShuffleBag from "../utilities/ShuffleBag.ts";
import PlayerService from "../PlayerService.ts";
import NavController from "../NavController.ts";
import { fireAndForget } from "../utilities/AsyncUtils.ts";

type FangornForestCharacter = {
    name: string;
    item: string;
    attribute: string;
};

export type NavCtrlPicker = Pick<NavController, "createNextChallenge">;

export default class FangornForest extends CarouselItem {
    private fangornForestCharacter: FangornForestCharacter = FangornForest.fangornForestStats();

    private constructor(private navController: NavCtrlPicker, private playerService: PlayerService, carouselItem: HTMLElement, private playerView: PlayerView = new PlayerView()) {
        super(carouselItem);
    }

    static async create(navController: NavCtrlPicker, playerService: PlayerService, template: TemplateGameTasks): Promise<FangornForest> {
        const element = await this.loadElement("../views/forest.html");
        const forest = loggingProxy(new FangornForest(navController, playerService, element));
        await forest.registerEvents();

        const footer = must(forest.carouselItem.querySelector("footer"));
        footer.after(template.templateFragment);

        forest.renderWelcomeMessage();

        return forest;
    }

    private async registerEvents(): Promise<void> {
        const btnAskForHP = must(this.carouselItem.querySelector("#btnAskForHP"));
        const btnAskForMP = must(this.carouselItem.querySelector("#btnAskForMP"));

        [btnAskForHP, btnAskForMP].forEach(btn => {
            btn.addEventListener("click", async () => {
                const whichHealth = btn.id === "btnAskForHP" ? "hp" : "mp";
                this.grantHealthPoints(whichHealth);
                this.setActionButtonsState(btnAskForHP, btnAskForMP);
                this.informHealthBoost();
                this.updatePlayerCards(whichHealth);

                // ask navController for where to go next
                this.setupNextChallenge()
            });
        });

    }

    private async setupNextChallenge() {
        // could be Lake, Bridge, or Mountain
        const nextChallenge = await this.navController.createNextChallenge(this);
        const nextChallengeName = must(nextChallenge.constructor.name);

        const goToNextButton = ons.createElement(/*html*/ `<ons-button id="btnGoToNextChallenge">${nextChallengeName}</ons-button>`) as HTMLElement;
        this.carouselItem.querySelector("#pForestResult")?.append(document.createElement('div'), goToNextButton);

        must(currentGameState.getPlayers()).currentScreen = nextChallengeName;

        goToNextButton.addEventListener("click", () => {
            this.carouselItem.replaceWith(nextChallenge.carouselItem);
        });

        PlayerService.saveActivePlayers();
    }

    private updatePlayerCards(whichHealth: "hp" | "mp"): void {
        const query = `ons-list-item[data-property="${whichHealth}"]`;
        const row = this.carouselItem.querySelectorAll(query);
        for (let i = 0; i < row.length; i++) {
            const column = row[i];
            must(column.querySelector(".clsValue")).textContent =
                (must(currentGameState?.getPlayers()?.players[i])[whichHealth]).toString();
            row[i].classList.add("row-flash");
        }
    }

    private informHealthBoost(): void {
        const tmpGold = this.grantGold();
        const message = /*html*/`Congratulation! ${this.fangornForestCharacter.name} has given you their ${this.fangornForestCharacter.item}, ${tmpGold} GOLD, and enhanced your status thus!`;

        const template = document.createElement('template');
        template.innerHTML = /*html*/`<p>${message}</p>`;
        this.carouselItem.querySelector('#pForestResult')?.appendChild(must(template.content.firstElementChild));
    }

    private setActionButtonsState(btnAskForHP: Element, btnAskForMP: Element): void {
        btnAskForHP.setAttribute("disabled", "true");
        btnAskForMP.setAttribute("disabled", "true");
    }

    private grantGold(): number {
        const tmpGold = Math.floor(Math.random() * 235) + 999;
        const party = must(currentGameState?.getPlayers());
        party.addGold(tmpGold);
        return tmpGold;
    }

    private grantHealthPoints(whichHealth: "hp" | "mp") {
        const rndFrac = Math.random();
        const hpBonus = Math.floor(((Math.random() * 10) + 10) * rndFrac);
        const mpBonus = Math.floor(((Math.random() * 10) + 20) * rndFrac);

        const players = must(currentGameState?.getPlayers()?.players);
        players.forEach(player => {
            if (whichHealth === "hp") {
                player.hp += hpBonus;
            } else {
                player.mp += mpBonus;
            }
        });

        if (whichHealth === "hp") {
            return hpBonus;
        } else {
            return mpBonus;
        }
    }

    renderWelcomeMessage(): void {
        this.playerView.renderPlayerCards(this.carouselItem, must(currentGameState?.getPlayers()?.players), ['hp', 'mp']);

        const playerNameElement = must(this.carouselItem.querySelector("#forestWelcoming"));
        const name = must(currentGameState?.getPlayers()?.players[0]).name;

        playerNameElement.innerHTML = /*html*/`Welcome, ${name}! You have reached the Fangorn forest. What's that ahead?. <p>You meet ${this.fangornForestCharacter.name} and their ${this.fangornForestCharacter.item} of ${this.fangornForestCharacter.attribute}. </p>`;

        const template = document.createElement('template');
        template.innerHTML = /*html*/`<p>You will ask ${this.fangornForestCharacter.name} to help your quest by granting you some of their ${this.fangornForestCharacter.attribute} from their ${this.fangornForestCharacter.item}!</p>`;

        must(this.carouselItem.querySelector('main')).appendChild(template.content.firstElementChild!);
    }

    static readonly arrNames = new ShuffleBag(["Adabor", "Bentrax", "Celiz", "Danitark", "Xullix", "Yizzoro", "Zana"]);
    static readonly arrItems = new ShuffleBag(["Secret Book", "Holy Codex", "Lost Parchment", "Gothic Scroll"]);
    static readonly arrAttributes = new ShuffleBag(["Power", "Wisdon", "Validation", "Insight", "Experience"]);
    private static fangornForestStats(): FangornForestCharacter {
        const randomName = FangornForest.arrNames.draw();
        const randomItem = FangornForest.arrItems.draw();
        const randomAttribute = FangornForest.arrAttributes.draw()
        return {
            name: randomName,
            item: randomItem,
            attribute: randomAttribute,
        };
    }
}
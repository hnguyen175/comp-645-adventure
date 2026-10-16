import TemplateGameTasks from "../templates/TemplateGameTasks.ts";
import CarouselItem from "./CarouselItem.ts";
import must from "../utilities/RequiredField.ts";
import Player from "../Player.ts";
import currentGameState from "../GameState.ts";
import loggingProxy from "../utilities/LoggingProxy.ts";
import PlayerView from "../rendering/PlayerView.ts";
import ShuffleBag from "../utilities/ShuffleBag.ts";

type FangornForestCharacter = {
    name: string;
    item: string;
    attribute: string;
};

type FangornForestBoostStats = {
    hp: number;
    mp: number;
};

export default class FangornForest extends CarouselItem {
    constructor(carouselItem: HTMLElement, private playerView: PlayerView = new PlayerView()) {
        super(carouselItem);
    }

    static async create(template: TemplateGameTasks): Promise<FangornForest> {
        const element = await this.loadElement("../views/forest.html");
        const forest = loggingProxy(new FangornForest(element));
        await forest.registerEvents();

        const footer = must(forest.carouselItem.querySelector("footer"));
        footer.after(template.templateFragment);

        return forest;
    }

    private async registerEvents(): Promise<void> {
        const btnAskForHP = must(this.carouselItem.querySelector("#btnAskForHP"));
        const btnAskForMP = must(this.carouselItem.querySelector("#btnAskForMP"));

        [btnAskForHP, btnAskForMP].forEach(btn => {
            btn.addEventListener("click", () => {
                const whichHealth = btn.id === "btnAskForHP" ? "hp" : "mp";
                const bonus = this.grantHealthPoints(whichHealth);
                this.setActionButtonsState(btnAskForHP, btnAskForMP);
                this.informHealthBoost(whichHealth, bonus);
                this.updatePlayerCards(whichHealth, bonus);
            });
        });
    }

    private updatePlayerCards(whichHealth: "hp" | "mp", bonus: number): void {
        const query = `ons-list-item[data-property="${whichHealth}"]`;
        const row = this.carouselItem.querySelectorAll(query);
        for (let i = 0; i < row.length; i++) {
            const column = row[i];
            must(column.querySelector(".clsValue")).textContent =
                (must(currentGameState?.getPlayers()?.players[i])[whichHealth] + bonus).toString();
            row[i].classList.add("row-flash");
        }
    }
    private informHealthBoost(whichHealth: "hp" | "mp", bonus: number): void {
        const healthType = whichHealth === "hp" ? "health points" : "mana points";
        const message = `You have been granted ${bonus} ${healthType} from the Fangorn Forest!`;

        const template = document.createElement('template');
        template.innerHTML = /*html*/`<p>${message}</p>`;
        this.carouselItem.querySelector('main')?.appendChild(must(template.content.firstElementChild));
    }

    private setActionButtonsState(btnAskForHP: Element | null = null, btnAskForMP: Element | null = null): void {
        if (!btnAskForHP || !btnAskForMP) {
            btnAskForHP = must(this.carouselItem.querySelector("#btnAskForHP"));
            btnAskForMP = must(this.carouselItem.querySelector("#btnAskForMP"));
        }

        btnAskForHP.setAttribute("disabled", "true");
        btnAskForMP.setAttribute("disabled", "true");
    }

    private grantHealthPoints(whichHealth: "hp" | "mp"): number {
        const rndFrac = Math.random();
        const players = must(currentGameState?.getPlayers()?.players);
        const bonus = Math.ceil(Player.randomStat() * rndFrac);

        players.forEach(player => {
            if (whichHealth === "hp") {
                player.hp += bonus;
            } else {
                player.mp += bonus;
            }
        });
        return bonus;
    }

    initializePage(): void {
        this.playerView.renderPlayerCards(this.carouselItem.id, must(currentGameState?.getPlayers()?.players), ['hp', 'mp']);

        const playerNameElement = must(this.carouselItem.querySelector("#forestWelcoming"));
        const name = must(currentGameState?.getPlayers()?.players[0]).name;
        const fangornResult = FangornForest.fangornForestStats();

        playerNameElement.innerHTML = /*html*/`Welcome, ${name}! You have reached the ghostly forest. What's that ahead?. <p>You meet ${fangornResult.name} and their ${fangornResult.item} of ${fangornResult.attribute}. </p>`;

        const template = document.createElement('template');
        template.innerHTML = /*html*/`<p>You will ask ${fangornResult.name} to help your quest by granting you some of their ${fangornResult.attribute} from their ${fangornResult.item}!</p>`;

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
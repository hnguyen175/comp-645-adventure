import NavController from './NavController.ts';
import wrapMethods from './utilities/WrapMethods.ts';

declare const ons: any;

export default class App {
    private navController: NavController;

    constructor() {
        this.navController = wrapMethods(new NavController());
        this.navController.init();

        ons.ready(() => this.DeviceReady());
    }

    private async DeviceReady() {
        console.log("Device is ready");

        await this.initialize();

        //this.InitializeDB();

        this.RegisterEventHandlers();
    }

    private async initialize(){
        await this.navController.loadCarouselItems(
            [
                "views/welcome.html",
                "views/new-game.html",
                "views/players.html"
            ]
        );
    }

    private InitializeDB() {
        const dbWorker = new Worker(
            "./js/DatabaseService.js",
            { type: "module" });

        dbWorker.onmessage = function (event) {
            if (event.data.type === "ready") {
                console.log("SQLite database ready");
            }

            if (event.data.type === "error") {
                console.error(
                    "SQLite error:",
                    event.data.message
                );
            }
        };
    }

    private RegisterEventHandlers() {
        document.getElementById("carouselNewGame")?.addEventListener(
            "prechange",
            (event) => this.navController.onCarouselPriorDisplayingItem(event)
        );

        document.getElementById("btnClearName")?.addEventListener(
            "click",
            (event) => {
                this.emptyInput("inputPlayerName");
            }
        );

        document.getElementById("btnClearEmail")?.addEventListener(
            "click",
            (event) => {
                this.emptyInput("inputPlayerEmail");
            }
        );

        document.getElementById("btnNewGame")?.addEventListener(
            "click",
            (event) => {
                this.navController.onCarouselNewGame(event);
            }
        );

        document.getElementById("btnRoll")?.addEventListener(
            "click",
            (event) => {
                console.log("Roll button clicked");
                // Implement the roll functionality here
                this.navController.onRollButtonClick(event);
            }
        );
        document.getElementById("btnReload")?.addEventListener(
            "click",
            async (event) => {
                console.log("Reload button clicked");
                await this.navController.loadCarouselItems(
                    [
                        "views/load-game.html",
                        "views/players.html"
                    ]
                );
                this.navController.onReloadButtonClick(event);

                this.registerLoadGameEvents();
            }
        );
    }

    private registerLoadGameEvents() {
        const lstPlayers = document.getElementById("lstPlayers");
        const btnLoadGame = document.getElementById("btnLoadGame");

        if (!lstPlayers || !btnLoadGame) {
            console.error("Load game elements not found.");
            return;
        }

        lstPlayers.addEventListener(
            "change",
            (event) => {
                btnLoadGame.removeAttribute("disabled");
            }
        );

        btnLoadGame.addEventListener(
            "click",
            (event) => {
                this.navController.onLoadGameButtonClick(event);
            }
        );
    }

    private emptyInput(inputId: string) : void {
        const input = document.getElementById(inputId) as HTMLInputElement || null;
        if (input) {
            input.value = "";
            input.focus();
        }
    }
};

const app = wrapMethods(new App());
import NavController from './NavController.js';

export default class App {
    private navController: NavController;

    constructor() {
        this.navController = new NavController();
        document.addEventListener("DOMContentLoaded",
            () => this.DeviceReady());
    }

    private async DeviceReady() {
        console.log("Device is ready");

        this.InitializeDB();

        this.RegisterEventHandlers();
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
        // document.addEventListener(
        //     "keydown",
        //     (event) => this.navController.navigateCarousel(event)
        // );

        document.getElementById("carouselNewGame")?.addEventListener(
            "prechange",
            (event) => this.navController.onCarouselPlayersPreChange(event)
        );

        document.getElementById("carouselNewGame")?.addEventListener(
            "postchange",
            (event) => this.navController.onCarouselNewGamePostChange(event)
        );

        // document.getElementById("btnNewGame")?.addEventListener(
        //     "click",
        //     (event) => this.navController.navigateCarousel(event)
        // );

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

        document.getElementById("caiWelcome")?.addEventListener(
            "click",
            (event) => {
                this.navController.onCarouselNewGame(event);
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

const app = new App();
import NavController from './NavController.ts';
import loggingProxy from './utilities/LoggingProxy.ts';

export default class App {
    private navController: NavController;

    constructor() {
        this.navController = loggingProxy(new NavController());

        ons.ready(() => this.DeviceReady());
    }

    private async DeviceReady() {
        console.log("Device is ready");
        await this.navController.init();

        await this.initialize();

        //this.InitializeDB();

        this.RegisterEventHandlers();
    }

    private async initialize() {
        await this.navController.loadCarouselItem(
            [
                this.navController.welcome,
                this.navController.newGame,
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
            (event) => {
                void this.handleButtonClick(event);
            }
        );
    }

    private async handleButtonClick(event: Event): Promise<void> {
        await this.navController.onCarouselPriorDisplayingItem(event);
    }
};

loggingProxy(new App());
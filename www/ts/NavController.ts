import Player from './Player.js';
import Players from './Players.js';
import type { OnsCarouselElement as CarouselElement } from '../lib/onsenui';

export default class NavController{
    static showSection(sectionId: string){
        let sections = document.querySelectorAll("section");
        if (!sections || sections.length == 0){
            console.error("No sections found in the document.");
            return;
        }

        for (let section of sections){
            if (section.id == sectionId){
                section.style.display = "block";
            } else {
                section.style.display = "none";
            }
        }
    }

    static navigateCarousel(event: Event){
        const carousel =
            document.getElementById("carouselNewGame") as CarouselElement | null;
        
        if (!carousel){
            console.error("Carousel element not found.");
            return;
        }

        if (event instanceof KeyboardEvent && event.type === "keydown") {

            const target = event.target;

            // Preserve typing and cursor movement in editable fields.
            // if (
            //     target instanceof HTMLElement &&
            //     (target.matches("input, textarea, select") ||
            //         target.isContentEditable)
            // ) {
            //     return;
            // }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                carousel.next();
                return;
            }
            else if (event.key === "ArrowLeft") {
                event.preventDefault();
                carousel.prev();
                return;
            }
        }

        if (event.type === "click" &&
            (event.currentTarget as HTMLElement)?.id === "btnNewGame") {
            carousel.next();
            return;
        }

        console.log("unexpected navigation event", event.currentTarget);
    }

    static onCarouselPlayersPreChange(event: Event) {
        const items = ((event as any).carousel as HTMLElement).querySelectorAll("ons-carousel-item");
        const activeItem = items[(event as any).activeIndex];

        if (activeItem?.id === "caiPlayers") {
            const playerNameInput = document.getElementById("inputPlayerName") as HTMLInputElement | null;
            const playerEmailInput = document.getElementById("inputPlayerEmail") as HTMLInputElement | null;

            if (!playerNameInput || !playerEmailInput) {
                console.error("Player form fields not found.");
                return;
            }
            
            const name = playerNameInput.value;
            const email = playerEmailInput.value;

            const player = new Player(name, email);
            const players = new Players();
            players.addPlayer(player);
            players.addDefaultPlayers();

            players.savePlayersToSessionStorage();
            console.log("Players saved to session storage:", JSON.stringify(players.players));

            player.save();
        } 

        // Use these values to query your data.
    }

    static onCarouselNewGamePostChange(event: Event) {
        const items = ((event as any).carousel as HTMLElement).querySelectorAll("ons-carousel-item");
        const activeItem = items[(event as any).activeIndex];

        if (activeItem?.id === "caiNewGame") {
            const player = Player.load();
            if (player) {
                const playerNameInput = document.getElementById("inputPlayerName") as HTMLInputElement | null;
                const playerEmailInput = document.getElementById("inputPlayerEmail") as HTMLInputElement | null;

                if (!playerNameInput || !playerEmailInput) {
                    console.error("Player form fields not found.");
                    return;
                }

                playerNameInput.value = player.name;
                playerEmailInput.value = player.email;
            }
        }
    }
};
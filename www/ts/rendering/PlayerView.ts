import Player from "../Player.ts";
import must from "../utilities/RequiredField.ts";
import createPlayerCard from "./PlayerDisplay.ts";

export default class PlayerView {
    renderPlayerCards(carouselItem: HTMLElement, players: Player[], columns: string[] = ['hp', 'str', 'spd', 'mp', 'luk', 'wep', 'cls']): void {
        const anchor = carouselItem.id;
        this.renderPlayerCardsByName(carouselItem, anchor, players, columns);
        // const playerCards = must(carouselItem.querySelector(`#${anchor} .player-cards`)) as HTMLElement;

        // this.drawPlayerCards(playerCards, players, columns);
    };

    renderPlayerCardsByName(carouselItem: HTMLElement, playerCardsContainer: string, players: Player[], columns: string[] = ['hp', 'str', 'spd', 'mp', 'luk', 'wep', 'cls']): void {
        const playerCards = must(carouselItem.querySelector(`#${playerCardsContainer} .player-cards`)) as HTMLElement;

        this.drawPlayerCards(playerCards, players, columns);
    };

    private drawPlayerCards(playerCards: HTMLElement, players: Player[], columns: string[]) {
        playerCards.innerHTML = ""; // Clear previous content
        players.forEach((player) => {
            playerCards.innerHTML += createPlayerCard(player, columns);
        });
    }

    // TODO - move this to class page
    showValidationToast(input: HTMLInputElement, message: string) {
        const rect = input.getBoundingClientRect();

        const messageElement = document.createElement("div");
        messageElement.classList.add("validation-toast");
        messageElement.textContent = message;
        messageElement.style.top = `${rect.top}px`;
        messageElement.style.left = `${rect.right + 12}px`;

        document.body.appendChild(messageElement);

        input.focus();

        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
}
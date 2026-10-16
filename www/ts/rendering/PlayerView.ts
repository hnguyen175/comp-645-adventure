import Player from "../Player.ts";
import must from "../utilities/RequiredField.ts";
import createPlayerCard from "./PlayerDisplay.ts";

export default class PlayerView {
    renderPlayerCards(carouselId: string, players: Player[], columns: string[] = [
        'hp', 'str', 'spd', 'mp', 'luk', 'wep', 'cls']): void {
        const playerCards = must(document.querySelector(`#${carouselId} .player-cards`)) as HTMLElement;

        playerCards.innerHTML = ""; // Clear previous content
        players.forEach((player) => {
            playerCards.innerHTML += createPlayerCard(player, columns);
        });
    };

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
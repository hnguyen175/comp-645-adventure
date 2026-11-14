import GameTasks from "../templates/GameTasks.ts";
import must from "../utilities/RequiredField.ts";
import CarouselItem from "./CarouselItem.ts";
import currentGameState from "../GameState.ts";
import { Grade } from "../Party.ts";

export default class Final extends CarouselItem {
  private constructor(carouselItem: HTMLElement) {
    super(carouselItem);
  }

  static async create(): Promise<Final> {
    const element = await this.loadElement("../views/final.html");

    const footer = must(element.querySelector("footer"));
    footer.after(GameTasks.instance.templateFragment);

    const final = new Final(element);
    final.showFinalResults();

    return final;
  }

  private static readonly feedback: Record<Grade, string> = {
    A: "Excellent work! You nailed this round.",
    B: "Great job! You were close to an A.",
    C: "Nice effort! Try for a B next time.",
    F: "This round didn’t go your way. Give it another shot!",
  };

  private showFinalResults(): void {
    const party = must(currentGameState.getParty());
    const grade = party.calculateFinalScore();
    const feedbackMessage = Final.feedback[grade];
    const pFinalResult = must(this.carouselItem.querySelector("#pFinalResult"));
    pFinalResult.innerHTML = `Your final score is: <strong>${grade}</strong>. ${feedbackMessage}`;
  }
}

import CarouselItem from "./CarouselItem.ts";
import must from "../utilities/RequiredField.ts";
import currentGameState from "../GameState.ts";
import Player from "../Player.ts";
import loggingProxy from "../utilities/LoggingProxy.ts";
import TemplateGameTasks from "../templates/TemplateGameTasks.ts";

type ChallengeResult = {
    outcome: "win" | "lose" | "tie";
    message: string;
    disableChallengeButtons: ("str" | "spd" | "mp")[];
}

type ChallengeData = {
    challengeName: string;
    playerChallengeName: string;
    playerChallengeValue: number;
    playerLuk: number;
    villainChallengeName: string;
    villainChallengeValue: number;
    villainLuk: number;
}


export default class DrunkenTavern extends CarouselItem {
    constructor(
        carouselItem: HTMLElement
    ) {
        super(carouselItem);
    }

    static async create(template: TemplateGameTasks): Promise<DrunkenTavern> {
        const element = must(await this.loadElement("../views/drunken-tavern.html"));
        const drunkadTavern = loggingProxy(new DrunkenTavern(element));

        const divDurnkenTavern = must(drunkadTavern.carouselItem.querySelector<HTMLElement>("#divDrunkenTavernChallenge"));

        divDurnkenTavern.after(template.templateFragment);

        drunkadTavern.registerEvents();
        return drunkadTavern;
    }

    private registerEvents(): void {
        const carouselItem = must(this.carouselItem);
        const carouselItemId = must(carouselItem.id);

        carouselItem.addEventListener("click", (event) => {
            const clickedElement = event.target as HTMLElement;
            if (clickedElement.closest(`#${carouselItemId} :is(#btnSTR, #btnSPD, #btnMP)`)) {
                const btnTxt = must(clickedElement.textContent);
                this.drunkenTavernChallenge(btnTxt.trim().toLowerCase() as keyof Player);
                return;
            }
        });
    }

    initializePage(): void {
        this.toggleAllChallengeButtons(true);
        this.tieBreakeChallenges = 0;

        // reset the challenge result message
        const divDrunkenTavernChallenge = must(this.carouselItem.querySelector<HTMLElement>("#divDrunkenTavernChallenge"));
        divDrunkenTavernChallenge.textContent = "";
    }

    toggleAllChallengeButtons(enable: boolean): void {
        this.toggleChallengeButtons(["str", "spd", "mp"], enable);
    }

    // grey out a particular challenge button
    toggleChallengeButtons(challenges: string[], enable: boolean): void {
        const carouselItem = must(this.carouselItem);
        challenges.forEach((challenge) => {
            const challengeButton = must(carouselItem.querySelector<HTMLElement>(`#btn${challenge.toUpperCase()}`));
            if (enable) {
                challengeButton.removeAttribute("disabled");
            } else {
                challengeButton.setAttribute("disabled", "true");
            }
        });
    };

    private drunkenTavernChallenge(challenge: keyof Player): void {
        const challengeResult = this.resolveChallenge(challenge);

        const divDrunkenTavernChallenge = must(this.carouselItem.querySelector<HTMLElement>("#divDrunkenTavernChallenge"));

        divDrunkenTavernChallenge.textContent = challengeResult.message;
        this.toggleChallengeButtons(challengeResult.disableChallengeButtons, false);
    }

    // private challengeResult: ChallengeResult = null as unknown as ChallengeResult;
    private resolveChallenge(challenge: keyof Player): ChallengeResult {
        const pickedPlayer = must(currentGameState.getPlayers()?.randomPlayerPicker());

        const villain = must(currentGameState.getDtkVillain());
        const villainChallengeValue = villain[challenge] as number;
        const playerChallengeValue = pickedPlayer[challenge] as number;
        const playerChallengeName = pickedPlayer.name;
        const villainChallengeName = villain.name;
        const challengeName = challenge.toUpperCase();
        const playerLuk = pickedPlayer.luk;
        const villainLuk = villain.luk;

        if (playerChallengeValue > villainChallengeValue) {
            return {
                outcome: "win",
                message: `${playerChallengeName} has won the challenge! ${playerChallengeName}'s ${challengeName} (${playerChallengeValue}) is greater than the ${villainChallengeName}'s  (${villainChallengeValue}).`,
                disableChallengeButtons: ["mp", "spd", "str"]
            } as ChallengeResult;
        }

        if (playerChallengeValue < villainChallengeValue) {
            return {
                outcome: "lose",
                message: `${playerChallengeName} has lost the challenge! Your ${challengeName} (${playerChallengeValue}) is less than the ${villainChallengeName}'s  (${villainChallengeValue}).`,
                disableChallengeButtons: ["mp", "spd", "str"]
            } as ChallengeResult;
        }

        return this.handleTieChallenge({ challengeName, playerChallengeName, playerChallengeValue, villainChallengeName, villainChallengeValue, playerLuk, villainLuk });
    }

    private tieBreakeChallenges = 0;
    private handleTieChallenge(challengeData: ChallengeData): ChallengeResult {
        if (challengeData.playerLuk > challengeData.villainLuk) {
            return {
                outcome: "win",
                message: `${challengeData.playerChallengeName} has won the challenge! ${challengeData.playerChallengeName}'s ${challengeData.challengeName} (${challengeData.playerChallengeValue}) is equal to the ${challengeData.villainChallengeName}, but ${challengeData.playerChallengeName}'s luck (${challengeData.playerLuk}) is greater than the ${challengeData.villainChallengeName}'s luck (${challengeData.villainLuk}).`,
                disableChallengeButtons: ["str", "spd", "mp"]
            } as ChallengeResult;
        }

        if (challengeData.playerLuk < challengeData.villainLuk) {
            return {
                outcome: "lose",
                message: `${challengeData.playerChallengeName} has lost the challenge! ${challengeData.playerChallengeName}'s ${challengeData.challengeName} (${challengeData.playerChallengeValue}) is equal to the ${challengeData.villainChallengeName}, but ${challengeData.playerChallengeName}'s luck (${challengeData.playerLuk}) is less than the ${challengeData.villainChallengeName}'s luck (${challengeData.villainLuk}).`,
                disableChallengeButtons: ["str", "spd", "mp"]
            } as ChallengeResult;
        }

        this.tieBreakeChallenges++;
        return {
            outcome: "tie",
            message: `The challenge has ended in a tie after ${this.tieBreakeChallenges} attempts. ${challengeData.playerChallengeName}'s ${challengeData.challengeName} (${challengeData.playerChallengeValue}) is equal to the ${challengeData.villainChallengeName}.`,
            disableChallengeButtons: [challengeData.challengeName.toLowerCase() as keyof Player]
        } as ChallengeResult;
    }
}
import must from '../utilities/RequiredField.ts';

class GoToNextChallenge {
    private goToNextChallengeFragment: DocumentFragment | null = null;

    get templateFragment(): DocumentFragment {
        this.goToNextChallengeFragment ??= must(document.querySelector<HTMLTemplateElement>("#templGoToNextChallenge")).content;
        return this.goToNextChallengeFragment.cloneNode(true) as DocumentFragment;
    }
}

export default new GoToNextChallenge();
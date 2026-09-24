class ShowIpButton {
    private button: HTMLInputElement;

    static init() {
        const button = document.querySelector('.js-show-ip') as HTMLInputElement;
        if (button) {
            new ShowIpButton(button);
        }
    }

    constructor(button: HTMLInputElement) {
        this.button = button;
        this.button.addEventListener('click', () => this.showIp());
    }

    async showIp() {
        try {
            const response = await fetch("https://api.ipify.org?format=json");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.button.value = `${data.ip}`;
            this.button.classList.remove('js-show-ip');
            this.button.classList.add('ip-found');
        } catch (error) {
            console.error('Error fetching IP address:', error);
            this.button.value = 'Error fetching IP';
        }
    }
};

ShowIpButton.init();
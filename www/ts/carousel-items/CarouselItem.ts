export default abstract class CarouselItem {
    constructor(private readonly _carouselItem: HTMLElement) {
    }

    static async loadElement(htmlPath: string): Promise<HTMLElement> {

        const response = await fetch(htmlPath);
        const html = await response.text();

        return ons.createElement(html.trim());
    }

    get carouselItem(): HTMLElement {
        return this._carouselItem;
    }

    toString(): string {
        return `name: ${this.constructor.name}, id: ${this.carouselItem.id}`;
    }
}
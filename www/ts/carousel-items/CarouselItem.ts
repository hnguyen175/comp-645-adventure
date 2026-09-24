export default abstract class CarouselItem {
    constructor (private readonly carouselItem : HTMLElement) {
    }
    
    static async loadElement(htmlPath: string): Promise<HTMLElement> {

        const response = await fetch(htmlPath);
        if (!response){
            throw new Error(`Can't load ${htmlPath}`);
        }
        const html = await response.text();

        return ons.createElement(html.trim());
    }

    getCarouselItem() : HTMLElement{
        return this.carouselItem;
    }
}
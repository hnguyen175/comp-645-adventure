import CarouselItem from "../../www/ts/carousel-items/CarouselItem";
import * as Vitest from "vitest";

class TestCarouselItem extends CarouselItem {
}

const comradesHtml = "../../www/views/comrades.html?raw";

Vitest.beforeAll(async () => {
    // Mock the fetch function to return the HTML content for the specified URLs
    Vitest.vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
        if (url.toString().endsWith("views/comrades.html?raw")) {
            const comrades = await import(comradesHtml);
            return new Response(comrades.default);
        }
        throw new Error(`Unexpected URL: ${url}`);
    });

    Vitest.vi.stubGlobal("ons", {
        createElement: (html: string) => {
            const template = document.createElement("template");
            template.innerHTML = html.trim();
            return template.content.firstElementChild as HTMLElement;
        },
    });
});

Vitest.test("loadElement should load an HTML element from a given path", async () => {
    const element = await TestCarouselItem.loadElement(comradesHtml);
    const testCarouselItem = new TestCarouselItem(element);

    Vitest.expect(element).toBeInstanceOf(HTMLElement);
    Vitest.expect(testCarouselItem.carouselItem).toBe(element);
    Vitest.expect(testCarouselItem.toString()).toContain("TestCarouselItem");
});

Vitest.test("loadElement should throw an error for an invalid path", async () => {
    await TestCarouselItem.loadElement("invalid/path.html").catch((error) => {
        Vitest.expect(error).toBeInstanceOf(Error);
        Vitest.expect(error.message).toContain("Unexpected URL: invalid/path.html");
    });
});
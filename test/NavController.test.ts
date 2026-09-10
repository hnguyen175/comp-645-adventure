// @vitest-environment jsdom

import * as Vitest from 'vitest';
import NavController from '../www/ts/NavController';

Vitest.beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = '';
    sessionStorage.clear();
});

Vitest.test("showSection displays the correct section and hides others", () => {
    // Create mock sections
    const section1 = document.createElement('section');
    section1.id = 'section1';
    section1.style.display = 'none';
    document.body.appendChild(section1);

    const section2 = document.createElement('section');
    section2.id = 'section2';
    section2.style.display = 'none';
    document.body.appendChild(section2);

    // Call the function
    NavController.showSection('section1');

    // Assert the correct behavior
    Vitest.expect(section1.style.display).toBe('block');
    Vitest.expect(section2.style.display).toBe('none');
});

Vitest.test("showSection logs an error if no sections are found", () => {
    // Spy on console.error
    const consoleErrorSpy = Vitest.vi.spyOn(console, 'error').mockImplementation(() => {});
    NavController.showSection('section1');
    Vitest.expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
});
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        testTimeout: 30000,
        coverage: {
            include: ['www/ts/**/*.ts']
        },
    },
});
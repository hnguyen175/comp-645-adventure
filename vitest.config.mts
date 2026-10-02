import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        testTimeout: 30000,
        setupFiles: ['./test/setup.ts'],
        coverage: {
            include: ['www/ts/**/*.ts']
        },
        include: ['test/**/*.ts'],
        exclude: ['test/setup.ts'],
    },
});
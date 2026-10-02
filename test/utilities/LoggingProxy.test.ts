import * as Vitest from 'vitest';
import loggingProxy from '../../www/ts/utilities/LoggingProxy';


class TestClass {
    property: string = "test";

    syncMethod(a: number, b: number): number {
        return a + b;
    }

    async asyncMethod(a: number, b: number): Promise<number> {
        return a * b;
    }

    async asyncError(): Promise<void> {
        throw new Error('Test error');
    }

    errorMethod(): void {
        throw new Error('Test error');
    }
}
const proxiedInstance = loggingProxy(new TestClass());

const mockConsoleLog = Vitest.vi.spyOn(console, 'log').mockImplementation(() => { });
const mockConsoleError = Vitest.vi.spyOn(console, 'error').mockImplementation(() => { });

Vitest.beforeEach(() => {
    Vitest.vi.clearAllMocks();
});

Vitest.test('LoggingProxy should log method calls and return values', async () => {

    const pro = proxiedInstance.property;
    Vitest.expect(mockConsoleLog).not.toHaveBeenCalledWith();

    // Test synchronous method
    const syncResult = proxiedInstance.syncMethod(2, 3);
    Vitest.expect(syncResult).toBe(5);
    Vitest.expect(mockConsoleLog).toHaveBeenCalledWith(Vitest.expect.stringContaining('→ TestClass.syncMethod('));
    Vitest.expect(mockConsoleLog).toHaveBeenCalledWith(Vitest.expect.stringContaining('→ TestClass.syncMethod('));

    // Test asynchronous method
    const asyncResult = await proxiedInstance.asyncMethod(2, 3);
    Vitest.expect(asyncResult).toBe(6);
    Vitest.expect(mockConsoleLog).toHaveBeenCalledWith(Vitest.expect.stringContaining('→ TestClass.syncMethod('));;
    Vitest.expect(mockConsoleLog).toHaveBeenCalledWith(Vitest.expect.stringContaining('→ TestClass.syncMethod('));;

    // Test method that throws an error
    try {
        proxiedInstance.errorMethod();
    } catch (error) {
        Vitest.expect(error).toEqual(new Error('Test error'));
        Vitest.expect(mockConsoleLog).toHaveBeenCalledWith(Vitest.expect.stringContaining('→ TestClass.syncMethod('));;
        Vitest.expect(mockConsoleError).toHaveBeenCalledWith(Vitest.expect.stringContaining('← TestClass.errorMethod()'));
    }

    try {
        await proxiedInstance.asyncError();
    } catch (error) {
        Vitest.expect(error).toEqual(new Error('Test error'));
        Vitest.expect(mockConsoleLog).toHaveBeenCalledWith(Vitest.expect.stringContaining('→ TestClass.asyncError()'));;
        Vitest.expect(mockConsoleError).toHaveBeenCalledWith(Vitest.expect.stringContaining('← TestClass.asyncError()'));
    }
});

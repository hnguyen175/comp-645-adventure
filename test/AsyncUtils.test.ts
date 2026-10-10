import * as Vitest from 'vitest';
import { fireAndForget } from '../www/ts/utilities/AsyncUtils';

Vitest.test('fireAndForget should log unhandled promise rejections', async () => {

    const asyncExFunc = async () => {
        throw new Error('Test error');
    }

    Vitest.vi.spyOn(console, 'error').mockImplementation(() => { });
    fireAndForget(asyncExFunc());

    // Wait for the promise to be rejected and the catch block to execute
    // await new Promise((resolve) => setTimeout(resolve, 100));
    Vitest.vi.waitFor(() => {
        Vitest.expect(console.error).toHaveBeenCalledWith('Unhandled promise rejection:', Vitest.expect.any(Error));
    });
});
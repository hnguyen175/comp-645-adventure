export function fireAndForget(promise: Promise<unknown>): void {
    void promise.catch((error) => {
        console.error("Unhandled promise rejection:", error);
    });
}
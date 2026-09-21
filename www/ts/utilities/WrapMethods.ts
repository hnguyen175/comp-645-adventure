export default function wrapMethods<T extends object>(target: T): T {
    let depth = 0;

    return new Proxy(target, {
        get(obj, property, receiver) {
            const value = Reflect.get(obj, property, receiver);

            if (typeof value !== "function") {
                return value;
            }

            return function (...args: any[]) {
                const className = obj.constructor.name;
                const methodName = String(property);

                const indent = "  ".repeat(depth++);
                const location = getCallerLocation();

                console.log(
                    `${indent}→ ${className}.${methodName}() ${location}`
                );

                const start = performance.now();

                try {
                    // receiver is important:
                    // this.otherMethod() will go through the Proxy too
                    const result = value.apply(receiver, args);

                    // Async
                    if (result && typeof result.then === "function") {
                        return result.then(
                            (returnValue: any) => {
                                endLog(start, className, methodName, console.log);

                                return returnValue;
                            },
                            (error: any) => {
                                endLog(start, className, methodName, console.error);

                                throw error;
                            }
                        );
                    }

                    // Synchronous
                    endLog(start, className, methodName, console.log);

                    return result;
                }
                catch (error) {
                    endLog(start, className, methodName, console.error);

                    throw error;
                }
            };

            function endLog(start: number, className: string, methodName: string,
                func: (log: string) => void) {
                const elapsed = performance.now() - start;

                const endIndent = "  ".repeat(--depth);

                const log = `${endIndent}← ${className}.${methodName}() ${elapsed.toFixed(2)} ms`;
                func(log);
            }
        }
    });
}

function getCallerLocation(): string {
    const stack = new Error().stack;

    if (!stack) {
        return "";
    }

    const caller = stack
        .split("\n")
        .find(line =>
            line.includes("http") &&
            !line.includes("WrapMethods")
        );

    if (!caller) {
        return "";
    }

    // Extract:
    // NavController.js:51
    // instead of:
    // http://localhost:8080/js/NavController.js:51:24
    const match = caller.match(/\/([^/]+):(\d+):\d+\)?$/);

    if (!match) {
        return "";
    }

    return `${match[1]}:${match[2]}`;
}
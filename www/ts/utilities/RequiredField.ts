export default function must<T>(
    value: T | null | undefined,
    message = "required value was not found"
): T {
    if (value == null){
        throw new Error(message);
    }
    return value;
}
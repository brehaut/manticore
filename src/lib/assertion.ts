export class AssertionFailure extends Error {

}

export function assertionFailure(message: string): never {
    throw new AssertionFailure(message);
}
/// Type definitions for things that are not typed in lib.d.ts
/// and do not provide their own type definitions 


interface PromiseExecutor<T> {
    (resolve:(v:T) => void, reject:(err:any) => void): void;
}

interface Promise<T> {
    then<NextT>(fulfilled?:(v:T)=>NextT|Promise<NextT>,
                rejected?:(err:any)=>NextT|Promise<NextT>):Promise<NextT>;
    'catch'(handle:(err:any) => any): any;
}

interface PromiseStatic {
    new<T> (ex:PromiseExecutor<T>): Promise<T>;

    resolve<T>(v:T|Promise<T>): Promise<T>;
    reject<T>(v:T|Promise<T>): Promise<T>;
    
    all<T>(ps:Promise<T>[]): Promise<T[]>;
    race<T>(ps:Promise<T>[]): Promise<T[]>;
    
}

declare var Promise: PromiseStatic;


// snaffled from ts es6.d.ts on github,
// minus support for itereables


interface ArrayConstructor {
    /**
      * Creates an array from an array-like object.
      * @param arrayLike An array-like object to convert to an array.
      * @param mapfn A mapping function to call on every element of the array.
      * @param thisArg Value of 'this' used to invoke the mapfn.
      */
    from<T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): Array<U>;

    /**
      * Creates an array from an array-like object.
      * @param arrayLike An array-like object to convert to an array.
      */
    from<T>(arrayLike: ArrayLike<T>): Array<T>;

    /**
      * Returns a new array from a set of elements.
      * @param items A set of elements to include in the new array object.
      */
    of<T>(...items: T[]): Array<T>;
}
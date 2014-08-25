/// Type definitions for things that are not typed in lib.d.ts
/// and do not provide their own type definitions 


interface PromiseExecutor<T> {
    (resolve:(v:T) => void, reject:(err:any) => void): void;
}

interface Promise<T> {
    then<NextT>(fulfilled?:(v:T)=>Promise<NextT>, rejected?:(err:any)=>Promise<NextT>):Promise<NextT>;
    // variants of then that support functor map are not provided, instead map here is
    // and is monkeypatched in in shims.ts\
    map<NextT>(fn:(v:T) => NextT):Promise<NextT>;
    'catch'(handle:(err:any) => any): any;
}

interface PromiseStatic {
    new<T> (ex:PromiseExecutor<T>): Promise<T>;
}

declare var Promise: PromiseStatic;

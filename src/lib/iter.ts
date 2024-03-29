export function* take<T>(iter: Iterable<T>, max: number): IterableIterator<T> {
    let count = 0;
    for (const v of iter) {        
        yield v;
        count += 1;
        if (count >= max) return;
    }
}


export function groupBy<T, TKey>(iter: Iterable<T>, key: (v:T) => TKey): Map<TKey, T[]> {
    const groups:Map<TKey, T[]> = new Map();

    for (const v of iter) {
        const k = key(v);
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k)!.push(v);
    }

    return groups;
}


export function* range(start:number, stop:number) {
    for (let i = start; i <= stop; i++) yield i;
}


export function every<X>(xs:Iterable<X>, pred:(x:X) => boolean): boolean {
    for (const x of xs) {
        if (pred(x) === false) return false;
    }
    return true;
}

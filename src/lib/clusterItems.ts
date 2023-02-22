interface Cluster<T> {title: string, items:T[]}

export function* clusterItems<T>(items: Iterable<T>, getName: (v:T)=>string, minSize = 4): IterableIterator<Cluster<T>> {
    let startingLetter: string | undefined;
    let currentLetter: string | undefined;
    let cluster: T[] = [];

    function createCluster():Cluster<T> {
        if (startingLetter === undefined || currentLetter === undefined) throw new Error("Assertion error");
        const title = startingLetter !== currentLetter ? `${startingLetter}–${currentLetter}` : startingLetter; 
        return {title, items:cluster};
    }

    for (const item of items) {
        const name = getName(item);
        const letter = name.charAt(0).toUpperCase();
        if (startingLetter === undefined) {
            startingLetter = letter;
            currentLetter = letter;
        }       

        if (cluster.length >= minSize && letter !== currentLetter) {
            yield createCluster();
            cluster = [item];
            startingLetter = letter;
            currentLetter = letter;
        }
        else {
            cluster.push(item);
            currentLetter = letter;
        }      
    }

    if (cluster.length > 0) {
        yield createCluster();
    }
}
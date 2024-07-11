/* eslint-disable @typescript-eslint/no-non-null-assertion */
function createUnionFindTree(count: number) {
    const parent = Array.from({ length: count }, (_, i) => i);
    const rank = new Array<number>(count).fill(0);

    function find(i: number): number {
        if (parent[i] !== i) {
            parent[i] = find(parent[i]!);
        }
        return parent[i];
    }

    function isSame(i: number, j: number) {
        return find(i) === find(j);
    }

    function unite(i: number, j: number) {
        const rootI = find(i);
        const rootJ = find(j);

        if (rootI === rootJ) return;

        if (rank[rootI]! < rank[rootJ]!) {
            parent[rootI] = rootJ;
        } else if (rank[rootI]! > rank[rootJ]!) {
            parent[rootJ] = rootI;
        } else {
            parent[rootJ] = rootI;
            rank[rootI]!++;
        }
    }

    return { isSame, unite };
}
function kruskal(count: number, getDistance: (i: number, j: number) => number) {
    const tree = createUnionFindTree(count);
    const relation: number[][] = Array.from({ length: count }, () => []);
    const oneArrayDist = [];
    for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
            oneArrayDist.push(getDistance(i, j));
        }
    }

    const sortedIndices = oneArrayDist
        .map((value, index) => ({ value, index }))
        .sort((a, b) => a.value - b.value)
        .map((item) => item.index);

    for (const k of sortedIndices) {
        const i = k % count;
        const j = Math.floor(k / count);
        if (
            !tree.isSame(i, j) &&
            relation[i]!.length < 2 &&
            relation[j]!.length < 2
        ) {
            relation[i]!.push(j);
            relation[j]!.push(i);
            tree.unite(i, j);
        }
    }

    function goNext(nextCity: number) {
        for (let i = 0; i < relation[nextCity]!.length; i++) {
            if (unvisitedCities.has(relation[nextCity]![i]!)) {
                return relation[nextCity]![i]!;
            }
        }
        return null;
    }

    const edge = [];
    for (let i = 0; i < count; i++) {
        if (relation[i]!.length === 1) {
            edge.push(i);
        }
    }
    relation[edge[0]!]!.push(edge[1]!);
    relation[edge[1]!]!.push(edge[0]!);

    const currentCity = 0;
    const unvisitedCities = new Set(
        Array.from({ length: count - 1 }, (_, i) => i + 1)
    );
    const tour = [currentCity];
    let nextCity = relation[currentCity]![0]!;
    while (unvisitedCities.size > 0) {
        unvisitedCities.delete(nextCity);
        tour.push(nextCity);
        nextCity = goNext(nextCity)!;
    }

    return tour;
}
function twoOpt(tour: number[], getDistance: (i: number, j: number) => number) {
    const N = tour.length;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        let count = 0;
        for (let i = 0; i < N - 2; i++) {
            for (let j = i + 2; j < N; j++) {
                const l1 = getDistance(tour[i]!, tour[i + 1]!);
                const l2 = getDistance(tour[j]!, tour[(j + 1) % N]!);
                const l3 = getDistance(tour[i]!, tour[j]!);
                const l4 = getDistance(tour[i + 1]!, tour[(j + 1) % N]!);
                if (l1 + l2 > l3 + l4) {
                    const newTour = tour.slice(i + 1, j + 1);
                    tour.splice(i + 1, j - i, ...newTour.reverse());
                    count++;
                }
            }
        }
        if (count === 0) {
            break;
        }
    }
    return tour;
}
function oneOrOpt(
    tour: number[],
    getDistance: (i: number, j: number) => number
) {
    const N = tour.length;
    let isImproved = false;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        let count = 0;
        for (let i = 0; i < N; i++) {
            const i0 = i;
            const i1 = (i + 1) % N;
            const i2 = (i + 2) % N;
            for (let j = 0; j < N; j++) {
                const j0 = j;
                const j1 = (j + 1) % N;
                if (j0 !== i0 && j0 !== i1) {
                    const l1 = getDistance(tour[i0]!, tour[i1]!);
                    const l2 = getDistance(tour[i1]!, tour[i2]!);
                    const l3 = getDistance(tour[j0]!, tour[j1]!);
                    const l4 = getDistance(tour[j0]!, tour[i1]!);
                    const l5 = getDistance(tour[j1]!, tour[i1]!);
                    const l6 = getDistance(tour[i0]!, tour[i2]!);
                    if (l1 + l2 + l3 > l4 + l5 + l6) {
                        const city = tour.splice(i1, 1)[0]!;
                        if (i1 < j1) {
                            tour.splice(j0, 0, city);
                        } else {
                            tour.splice(j1, 0, city);
                        }
                        count++;
                    }
                }
            }
        }
        if (count === 0) {
            break;
        }
        isImproved = true;
    }
    return isImproved;
}
function twoOrOpt(
    tour: number[],
    getDistance: (i: number, j: number) => number
) {
    const N = tour.length;
    let isImproved = false;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        let count = 0;
        for (let i = 0; i < N; i++) {
            const i0 = i;
            const i1 = (i + 1) % N;
            const i2 = (i + 2) % N;
            const i3 = (i + 3) % N;
            for (let j = 0; j < N; j++) {
                const j0 = j;
                const j1 = (j + 1) % N;
                if (j0 !== i0 && j0 !== i1 && j0 !== i2) {
                    const l1 = getDistance(tour[i0]!, tour[i1]!);
                    const l2 = getDistance(tour[i2]!, tour[i3]!);
                    const l3 = getDistance(tour[j0]!, tour[j1]!);
                    const l4 = getDistance(tour[j0]!, tour[i1]!);
                    const l5 = getDistance(tour[j1]!, tour[i2]!);
                    const l6 = getDistance(tour[i0]!, tour[i3]!);
                    if (l1 + l2 + l3 > l4 + l5 + l6) {
                        if (i2 === 0) {
                            const city1 = tour.splice(i1, 1)[0]!;
                            const city2 = tour.splice(
                                i2 === 0 ? N - 1 : i2 - 1,
                                1
                            )[0]!;
                            tour.splice(j0, 0, city2, city1);
                        } else {
                            const city2 = tour.splice(i2, 1)[0]!;
                            const city1 = tour.splice(i1, 1)[0]!;
                            if (i1 < j1) {
                                tour.splice(j0 - 1, 0, city1, city2);
                            } else {
                                tour.splice(j1, 0, city1, city2);
                            }
                        }
                        count++;
                    }
                }
            }
        }
        if (count === 0) {
            break;
        }
        isImproved = true;
    }
    return isImproved;
}
function solveByDp(
    count: number,
    getDistance: (i: number, j: number) => number
) {
    const allVisited = (1 << count) - 1;

    const dp = new Array<number>(1 << count)
        .fill(0)
        .map(() => Array<number>(count).fill(Infinity));

    const parent = Array<number>(1 << count)
        .fill(0)
        .map(() => Array<number>(count).fill(NaN));

    dp[1]![0] = 0;

    for (let mask = 1; mask < 1 << count; mask++) {
        for (let end = 0; end < count; end++) {
            if ((mask & (1 << end)) === 0) continue;

            for (let next = 0; next < count; next++) {
                if (next === end || mask & (1 << next)) continue;

                const newMask = mask | (1 << next);
                const newCost = dp[mask]![end]! + getDistance(end, next);

                if (newCost < dp[newMask]![next]!) {
                    dp[newMask]![next] = newCost;
                    parent[newMask]![next] = end;
                }
            }
        }
    }

    let optimalCost = Infinity;
    let lastCity = -1;
    for (let end = 1; end < count; end++) {
        const cost = dp[allVisited]![end]! + getDistance(end, 0);
        if (cost < optimalCost) {
            optimalCost = cost;
            lastCity = end;
        }
    }

    // Reconstruct the path
    const path = [];
    let mask = allVisited;
    let city = lastCity;
    while (city !== null) {
        path.unshift(city);
        const newMask = mask ^ (1 << city);
        const newCity = parent[mask]![city]!;
        mask = newMask;
        city = newCity;
    }
    path.push(0); // Return to the starting city

    return { path, cost: optimalCost };
}
export function solveTsp(
    count: number,
    getDistance: (i: number, j: number) => number
) {
    if (count <= 0) return [];
    if (count === 1) return [0];

    // if (count < 12) {
    //     return solveByDp(count, getDistance).path;
    // }
    const tour = kruskal(count, getDistance);
    twoOpt(tour, getDistance);
    oneOrOpt(tour, getDistance);
    twoOrOpt(tour, getDistance);
    return tour;
}

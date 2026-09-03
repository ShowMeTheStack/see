/*
 * title: Kruskal's cheapest network
 * level: 4
 * about: Builds a minimum spanning tree for a cable network by sorting the edges and joining components with union-find.
 */
#include <stdio.h>
#include <stdlib.h>

struct edge {
    int u, v;
    int cost;
};

#define NV 8

const char *site[NV] = { "hub", "lab", "gym", "hall", "shop", "farm", "mill", "pier" };

/*
 * Union-find: parent[x] points towards the representative of x's group.
 * Two sites are already connected exactly when they have the same root.
 */
int parent[NV];
int rank_[NV];

int find(int x)
{
    /* Path halving: point every other node at its grandparent as we go. */
    while (parent[x] != x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
    }
    return x;
}

int unite(int a, int b)
{
    a = find(a);
    b = find(b);
    if (a == b)
        return 0;           /* same group: this edge would close a cycle */
    if (rank_[a] < rank_[b]) { int t = a; a = b; b = t; }
    parent[b] = a;          /* hang the shallower tree under the deeper */
    if (rank_[a] == rank_[b])
        rank_[a]++;
    return 1;
}

int by_cost(const void *x, const void *y)
{
    const struct edge *a = x, *b = y;
    return a->cost - b->cost;
}

int main(void)
{
    struct edge e[] = {
        { 0, 1, 4 }, { 0, 2, 3 }, { 1, 2, 5 }, { 1, 3, 2 }, { 2, 3, 7 },
        { 2, 4, 8 }, { 3, 4, 4 }, { 3, 5, 6 }, { 4, 5, 3 }, { 4, 6, 9 },
        { 5, 6, 5 }, { 5, 7, 7 }, { 6, 7, 2 }, { 0, 7, 12 }
    };
    int ne = sizeof e / sizeof e[0];
    int i, taken = 0, total = 0;

    for (i = 0; i < NV; i++) {
        parent[i] = i;
        rank_[i] = 0;
    }

    /*
     * Kruskal's greedy rule: look at cables from cheapest to dearest and
     * lay each one unless its two ends are already connected.
     */
    qsort(e, ne, sizeof e[0], by_cost);

    for (i = 0; i < ne && taken < NV - 1; i++) {
        printf("%-4s - %-4s cost %2d: ", site[e[i].u], site[e[i].v], e[i].cost);
        if (unite(e[i].u, e[i].v)) {
            printf("lay it\n");
            taken++;
            total += e[i].cost;
        } else {
            printf("skip, already connected\n");
        }
    }

    printf("%d cables, total cost %d\n", taken, total);
    printf("groups after the build (root of each site):");
    for (i = 0; i < NV; i++)
        printf(" %d", find(i));
    printf("\n");
    return 0;
}

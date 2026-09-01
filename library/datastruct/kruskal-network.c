/*
 * title: Cheapest cable network with Kruskal's algorithm
 * level: 4
 * about: Finds a minimum spanning tree for a set of villages by sorting cable costs with qsort and using union-find to skip cables that would close a loop.
 */
#include <stdio.h>
#include <stdlib.h>

#define V 8

static const char *village[V] = {
    "Ashby", "Brook", "Carrow", "Denton", "Elmsted", "Fenwick", "Gorley", "Hythe"
};

struct cable {
    int a, b;
    int cost;
};

/* Union-find on a heap-allocated parent array, wrapped in a struct. */
struct dsu {
    int *parent;
    int *rank;
    int n;
};

int dsu_init(struct dsu *d, int n)
{
    int i;
    d->n = n;
    d->parent = malloc(n * sizeof *d->parent);
    d->rank = malloc(n * sizeof *d->rank);
    if (d->parent == NULL || d->rank == NULL)
        return 0;
    for (i = 0; i < n; i++) {
        d->parent[i] = i;
        d->rank[i] = 0;
    }
    return 1;
}

void dsu_free(struct dsu *d)
{
    free(d->parent);
    free(d->rank);
}

/* Iterative find with path halving: each step points a node at its
   grandparent. Same effect as full compression, no recursion. */
int dsu_find(struct dsu *d, int x)
{
    while (d->parent[x] != x) {
        d->parent[x] = d->parent[d->parent[x]];
        x = d->parent[x];
    }
    return x;
}

int dsu_union(struct dsu *d, int a, int b)
{
    int ra = dsu_find(d, a), rb = dsu_find(d, b);
    if (ra == rb)
        return 0;                     /* already connected */
    if (d->rank[ra] < d->rank[rb]) { int t = ra; ra = rb; rb = t; }
    d->parent[rb] = ra;
    if (d->rank[ra] == d->rank[rb])
        d->rank[ra]++;
    return 1;
}

int by_cost(const void *x, const void *y)
{
    const struct cable *a = (const struct cable *)x;
    const struct cable *b = (const struct cable *)y;
    return a->cost - b->cost;
}

int main(void)
{
    struct cable cables[] = {
        { 0, 1, 7 }, { 0, 3, 5 }, { 1, 2, 8 }, { 1, 3, 9 }, { 1, 4, 7 },
        { 2, 4, 5 }, { 3, 4, 15 }, { 3, 5, 6 }, { 4, 5, 8 }, { 4, 6, 9 },
        { 5, 6, 11 }, { 6, 7, 4 }, { 5, 7, 13 }, { 2, 7, 12 }
    };
    int m = (int)(sizeof cables / sizeof cables[0]);
    struct dsu d;
    int i, used = 0, total = 0;

    if (!dsu_init(&d, V)) {
        printf("out of memory\n");
        dsu_free(&d);
        return 0;
    }

    /* Kruskal: take cables from cheapest to dearest. A cable is worth laying
       only if its two villages are not yet connected; union-find answers that
       question almost instantly. Greedy, and provably optimal. */
    qsort(cables, m, sizeof cables[0], by_cost);
    for (i = 0; i < m && used < V - 1; i++) {
        struct cable *c = &cables[i];
        if (dsu_union(&d, c->a, c->b)) {
            used++;
            total += c->cost;
            printf("lay   %-8s - %-8s cost %2d\n", village[c->a], village[c->b], c->cost);
        } else {
            printf("skip  %-8s - %-8s cost %2d (would make a loop)\n",
                   village[c->a], village[c->b], c->cost);
        }
    }
    printf("%d cables, total cost %d\n", used, total);
    printf("every village has root %s\n", village[dsu_find(&d, 0)]);

    dsu_free(&d);
    return 0;
}

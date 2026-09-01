/*
 * title: Shortest driving distances with Dijkstra
 * level: 4
 * about: Reads a weighted road network into adjacency lists, runs Dijkstra's algorithm with a binary-heap priority queue, and prints the shortest distance and route to every town.
 * input: 7 11\n0 1 7\n0 2 9\n0 5 14\n1 2 10\n1 3 15\n2 3 11\n2 5 2\n3 4 6\n4 5 9\n4 6 3\n3 6 12\n0\n
 */
#include <stdio.h>
#include <stdlib.h>

#define MAXN 16
#define INF 1000000

struct road {
    int to, km;
    struct road *next;
};

/* Heap entries are (distance, town) pairs. A town can be in the heap more
   than once with different distances; stale entries are skipped when popped.
   This "lazy deletion" is simpler than updating entries in place. */
struct item {
    int dist, town;
};

struct heap {
    struct item *a;
    int n, cap;
};

void heap_push(struct heap *h, int dist, int town)
{
    int i;
    if (h->n == h->cap) {
        struct item *bigger;
        h->cap = h->cap ? h->cap * 2 : 4;
        bigger = realloc(h->a, h->cap * sizeof *bigger);
        if (bigger == NULL)
            exit(1);
        h->a = bigger;
    }
    i = h->n++;
    while (i > 0 && h->a[(i - 1) / 2].dist > dist) {
        h->a[i] = h->a[(i - 1) / 2];          /* move the parent down */
        i = (i - 1) / 2;
    }
    h->a[i].dist = dist;
    h->a[i].town = town;
}

struct item heap_pop(struct heap *h)
{
    struct item top = h->a[0], last = h->a[--h->n];
    int i = 0;
    for (;;) {
        int c = 2 * i + 1;
        if (c >= h->n)
            break;
        if (c + 1 < h->n && h->a[c + 1].dist < h->a[c].dist)
            c++;
        if (h->a[c].dist >= last.dist)
            break;
        h->a[i] = h->a[c];
        i = c;
    }
    if (h->n > 0)
        h->a[i] = last;
    return top;
}

void print_route(const int *prev, int t)
{
    if (prev[t] >= 0) {
        print_route(prev, prev[t]);
        printf(" -> ");
    }
    printf("%d", t);
}

int main(void)
{
    struct road *adj[MAXN];
    int dist[MAXN], prev[MAXN], done[MAXN];
    struct heap h = { NULL, 0, 0 };
    int n, m, i, a, b, km, src, pops = 0;

    if (scanf("%d %d", &n, &m) != 2 || n < 1 || n > MAXN)
        return 0;
    for (i = 0; i < n; i++)
        adj[i] = NULL;
    for (i = 0; i < m && scanf("%d %d %d", &a, &b, &km) == 3; i++) {
        struct road *r1 = malloc(sizeof *r1), *r2 = malloc(sizeof *r2);
        if (r1 == NULL || r2 == NULL)
            exit(1);
        r1->to = b; r1->km = km; r1->next = adj[a]; adj[a] = r1;
        r2->to = a; r2->km = km; r2->next = adj[b]; adj[b] = r2;
    }
    if (scanf("%d", &src) != 1)
        src = 0;

    for (i = 0; i < n; i++) {
        dist[i] = INF;
        prev[i] = -1;
        done[i] = 0;
    }
    dist[src] = 0;
    heap_push(&h, 0, src);

    /* Always settle the nearest unsettled town next. Its distance can no
       longer improve, because every other route would go through a town that
       is already at least as far away. */
    while (h.n > 0) {
        struct item it = heap_pop(&h);
        struct road *r;
        pops++;
        if (done[it.town])
            continue;                          /* a stale entry */
        done[it.town] = 1;
        for (r = adj[it.town]; r != NULL; r = r->next)
            if (dist[it.town] + r->km < dist[r->to]) {
                dist[r->to] = dist[it.town] + r->km;
                prev[r->to] = it.town;
                heap_push(&h, dist[r->to], r->to);
            }
    }

    for (i = 0; i < n; i++) {
        printf("to %d: ", i);
        if (dist[i] == INF) {
            printf("unreachable\n");
            continue;
        }
        printf("%3d km  ", dist[i]);
        print_route(prev, i);
        printf("\n");
    }
    printf("%d heap pops, heap grew to %d slots\n", pops, h.cap);

    free(h.a);
    for (i = 0; i < n; i++)
        while (adj[i] != NULL) {
            struct road *r = adj[i];
            adj[i] = r->next;
            free(r);
        }
    return 0;
}

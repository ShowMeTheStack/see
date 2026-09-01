/*
 * title: Fewest stops on a metro map with BFS
 * level: 3
 * about: Stores a metro network as adjacency lists of heap nodes and uses breadth-first search with a queue to find the route with the fewest stops between stations.
 */
#include <stdio.h>
#include <stdlib.h>

#define N 10

static const char *station[N] = {
    "Airport", "Bridge", "Castle", "Docks", "Exchange",
    "Fairground", "Garden", "Harbour", "Institute", "Junction"
};

/* Adjacency lists: for each station, a linked list of the stations one stop
   away. An undirected track appears in both lists. Open adj[] in the memory
   picture: ten heads, each with a little chain of edge nodes hanging off it. */
struct edge {
    int to;
    struct edge *next;
};

struct edge *adj[N];

void add_track(int a, int b)
{
    struct edge *e = malloc(sizeof *e), *f = malloc(sizeof *f);
    if (e == NULL || f == NULL)
        exit(1);
    e->to = b; e->next = adj[a]; adj[a] = e;
    f->to = a; f->next = adj[b]; adj[b] = f;
}

/* BFS visits stations in rings: first everything 1 stop away, then 2, and so
   on, so the first time it reaches a station is by a shortest route. The
   queue is a plain array, because each station enters it at most once.
   prev[v] remembers which station we came from, for rebuilding the route. */
void route(int from, int to)
{
    int queue[N], head = 0, tail = 0;
    int dist[N], prev[N], path[N];
    int v, len = 0;
    struct edge *e;

    for (v = 0; v < N; v++) {
        dist[v] = -1;
        prev[v] = -1;
    }
    dist[from] = 0;
    queue[tail++] = from;
    while (head < tail) {
        int u = queue[head++];
        if (u == to)
            break;
        for (e = adj[u]; e != NULL; e = e->next)
            if (dist[e->to] < 0) {
                dist[e->to] = dist[u] + 1;
                prev[e->to] = u;
                queue[tail++] = e->to;
            }
    }

    if (dist[to] < 0) {
        printf("%s to %s: no route\n", station[from], station[to]);
        return;
    }
    /* Follow prev[] backwards from the destination, then print in reverse. */
    for (v = to; v != -1; v = prev[v])
        path[len++] = v;
    printf("%s to %s, %d stop%s:", station[from], station[to], dist[to],
           dist[to] == 1 ? "" : "s");
    while (len > 0)
        printf(" %s", station[path[--len]]);
    printf("\n");
}

int main(void)
{
    int v;
    struct edge *e;

    add_track(0, 1); add_track(1, 2); add_track(2, 3); add_track(3, 7);
    add_track(1, 4); add_track(4, 5); add_track(5, 6); add_track(6, 7);
    add_track(4, 6); add_track(2, 4);
    /* Institute and Junction have their own little line, not connected. */
    add_track(8, 9);

    for (v = 0; v < N; v++) {
        printf("%-10s:", station[v]);
        for (e = adj[v]; e != NULL; e = e->next)
            printf(" %s", station[e->to]);
        printf("\n");
    }
    printf("\n");
    route(0, 7);
    route(3, 5);
    route(7, 0);
    route(6, 6);
    route(0, 9);

    for (v = 0; v < N; v++)
        while (adj[v] != NULL) {
            e = adj[v];
            adj[v] = e->next;
            free(e);
        }
    return 0;
}

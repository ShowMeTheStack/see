/*
 * title: Dijkstra's shortest paths between towns
 * level: 4
 * about: Finds the shortest road distance from one town to every other on a small weighted map, and prints each route.
 */
#include <stdio.h>
#include <limits.h>

#define N 7
#define NONE INT_MAX

const char *town[N] = { "Ashby", "Brook", "Carrow", "Dunmore", "Elm", "Fenwick", "Glen" };

/*
 * The map as an adjacency matrix: road[i][j] is the length of the road
 * between towns i and j, or 0 when there is no direct road. Roads go
 * both ways, so the matrix is symmetric.
 */
int road[N][N] = {
    /*  A   B   C   D   E   F   G */
    {   0,  7,  9,  0,  0, 14,  0 },   /* Ashby */
    {   7,  0, 10, 15,  0,  0,  0 },   /* Brook */
    {   9, 10,  0, 11,  0,  2,  0 },   /* Carrow */
    {   0, 15, 11,  0,  6,  0,  8 },   /* Dunmore */
    {   0,  0,  0,  6,  0,  9,  3 },   /* Elm */
    {  14,  0,  2,  0,  9,  0,  0 },   /* Fenwick */
    {   0,  0,  0,  8,  3,  0,  0 }    /* Glen */
};

/* Print the route to t by following prev[] back to the start, recursively. */
void print_route(const int prev[], int t)
{
    if (prev[t] != -1) {
        print_route(prev, prev[t]);
        printf(" -> ");
    }
    printf("%s", town[t]);
}

int main(void)
{
    int dist[N], prev[N], done[N];
    int i, u, v, step, start = 0;

    for (i = 0; i < N; i++) {
        dist[i] = NONE;     /* "infinitely far" until a road reaches it */
        prev[i] = -1;
        done[i] = 0;
    }
    dist[start] = 0;

    /*
     * Each round, settle the closest town that is not settled yet. Its
     * distance can no longer improve: any other way to it would pass
     * through a town that is already at least as far. Then try to
     * shorten the distances of its neighbours ("relax" the roads).
     */
    for (step = 0; step < N; step++) {
        u = -1;
        for (i = 0; i < N; i++)
            if (!done[i] && dist[i] != NONE && (u == -1 || dist[i] < dist[u]))
                u = i;
        if (u == -1)
            break;          /* the rest cannot be reached */
        done[u] = 1;
        printf("settle %-8s at %2d:", town[u], dist[u]);

        for (v = 0; v < N; v++) {
            if (road[u][v] && !done[v] && dist[u] + road[u][v] < dist[v]) {
                dist[v] = dist[u] + road[u][v];
                prev[v] = u;
                printf(" %s=%d", town[v], dist[v]);
            }
        }
        printf("\n");
    }

    printf("\nfrom %s:\n", town[start]);
    for (i = 0; i < N; i++) {
        if (dist[i] == NONE) {
            printf("  %-8s unreachable\n", town[i]);
            continue;
        }
        printf("  %-8s %3d  ", town[i], dist[i]);
        print_route(prev, i);
        printf("\n");
    }
    return 0;
}

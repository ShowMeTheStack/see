/*
 * title: Ordering courses with depth-first search
 * level: 3
 * about: Reads course prerequisites into a directed graph of adjacency lists, then uses recursive depth-first search to print an order that respects them, or reports a cycle.
 * input: 7\nalgebra calculus\ncalculus physics\nprogramming datastructures\ndatastructures algorithms\nalgebra algorithms\nphysics robotics\nprogramming robotics\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAXV 16

struct edge {
    int to;
    struct edge *next;
};

char name[MAXV][16];
struct edge *adj[MAXV];
int nv = 0;

/* Each vertex is WHITE (not seen), GREY (on the current DFS path) or BLACK
   (finished). Meeting a GREY vertex again means we went round a loop. */
enum colour { WHITE, GREY, BLACK };
enum colour colour[MAXV];

int order[MAXV], norder = 0;

int vertex(const char *s)
{
    int i;
    for (i = 0; i < nv; i++)
        if (strcmp(name[i], s) == 0)
            return i;
    strcpy(name[nv], s);
    adj[nv] = NULL;
    return nv++;
}

void add_edge(int a, int b)
{
    struct edge *e = malloc(sizeof *e);
    if (e == NULL)
        exit(1);
    e->to = b;
    e->next = adj[a];
    adj[a] = e;
}

/* Visit everything reachable from v, then record v. A course is recorded only
   after every course that depends on it, so the list read backwards is a valid
   study order. Pause on the deepest call and the stack panel shows the chain
   of courses being explored. */
int dfs(int v)
{
    struct edge *e;
    colour[v] = GREY;
    for (e = adj[v]; e != NULL; e = e->next) {
        if (colour[e->to] == GREY) {
            printf("cycle: %s leads back to %s\n", name[v], name[e->to]);
            return 0;
        }
        if (colour[e->to] == WHITE && !dfs(e->to))
            return 0;
    }
    colour[v] = BLACK;
    order[norder++] = v;
    return 1;
}

int main(void)
{
    char a[16], b[16];
    int m, i, ok = 1;
    struct edge *e;

    if (scanf("%d", &m) != 1)
        return 0;
    for (i = 0; i < m && scanf("%15s %15s", a, b) == 2; i++) {
        /* Evaluate the two lookups in separate statements so the vertices are
           numbered in the order they appear in the input. */
        int from = vertex(a);
        int to = vertex(b);
        add_edge(from, to);
    }

    for (i = 0; i < nv; i++)
        colour[i] = WHITE;
    for (i = 0; i < nv && ok; i++)
        if (colour[i] == WHITE)
            ok = dfs(i);

    if (ok) {
        printf("a study order for %d courses:\n", nv);
        for (i = norder - 1; i >= 0; i--)
            printf("  %d. %s\n", norder - i, name[order[i]]);
    }

    for (i = 0; i < nv; i++)
        while (adj[i] != NULL) {
            e = adj[i];
            adj[i] = e->next;
            free(e);
        }
    return 0;
}

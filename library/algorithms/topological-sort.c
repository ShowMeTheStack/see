/*
 * title: Course order by topological sort
 * level: 3
 * about: Orders courses so every prerequisite comes first, using Kahn's algorithm on adjacency lists built on the heap, and detects a cycle.
 */
#include <stdio.h>
#include <stdlib.h>

#define NC 8

const char *course[NC] = {
    "Maths 1", "Maths 2", "Programming", "Data structures",
    "Algorithms", "Databases", "Compilers", "Graphics"
};

/* One node of an adjacency list: "from must come before to". */
struct arc {
    int to;
    struct arc *next;
};

struct arc *out[NC];    /* out[c] lists the courses that need course c */
int indeg[NC];          /* how many prerequisites course c still waits for */

void require(int before, int after)
{
    struct arc *a = malloc(sizeof *a);
    if (a == NULL)
        exit(1);
    a->to = after;
    a->next = out[before];  /* push on the front of the list */
    out[before] = a;
    indeg[after]++;
}

void free_lists(void)
{
    struct arc *a, *next;
    int c;
    for (c = 0; c < NC; c++) {
        for (a = out[c]; a != NULL; a = next) {
            next = a->next;     /* read next before freeing the node */
            free(a);
        }
        out[c] = NULL;
    }
}

int main(void)
{
    int queue[NC];
    int head = 0, tail = 0, c, done = 0;
    struct arc *a;

    require(0, 1);  /* Maths 1 before Maths 2 */
    require(2, 3);  /* Programming before Data structures */
    require(3, 4);
    require(1, 4);
    require(3, 5);
    require(4, 6);
    require(2, 6);
    require(1, 7);
    require(2, 7);

    /*
     * In See, open the heap: each require() added one small block, and
     * out[] in the globals points into chains of them.
     *
     * Kahn's algorithm: start with every course that has no
     * prerequisites. Taking a course removes one prerequisite from each
     * course that follows it; any that reach zero join the queue.
     */
    for (c = 0; c < NC; c++)
        if (indeg[c] == 0)
            queue[tail++] = c;

    printf("a possible order:\n");
    while (head < tail) {
        c = queue[head++];
        printf("  %d. %s\n", ++done, course[c]);
        for (a = out[c]; a != NULL; a = a->next)
            if (--indeg[a->to] == 0)
                queue[tail++] = a->to;
    }
    if (done < NC)
        printf("only %d of %d courses: there is a cycle\n", done, NC);

    /* Now add a silly rule that closes a loop, and run again. */
    free_lists();
    for (c = 0; c < NC; c++)
        indeg[c] = 0;
    require(0, 1);
    require(1, 2);
    require(2, 0);  /* Programming before Maths 1: a cycle */
    head = tail = done = 0;
    for (c = 0; c < NC; c++)
        if (indeg[c] == 0)
            queue[tail++] = c;
    while (head < tail) {
        c = queue[head++];
        done++;
        for (a = out[c]; a != NULL; a = a->next)
            if (--indeg[a->to] == 0)
                queue[tail++] = a->to;
    }
    printf("with a circular rule only %d of %d courses can be ordered\n", done, NC);

    free_lists();
    return 0;
}

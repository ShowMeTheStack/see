/*
 * title: tail -n with a ring of lines
 * level: 3
 * about: Prints the last n lines of its input, keeping only n heap-allocated lines at a time in a circular array of pointers.
 * args: -4
 * input: one\ntwo\nthree\nfour\nfive\nsix\nseven\neight\nnine\nten\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define DEFLINES 10
#define MAXLEN 200

/* Exercise 5-13. We cannot know which lines are the last until the input
   ends, but we never need to hold more than n of them. A ring of n
   pointers does it: line i goes into slot i % n, overwriting (and
   freeing) the line from n lines ago. In the heap panel the number of
   line blocks grows to n and then stays there; each new line takes the
   place of the oldest. */
int main(int argc, char *argv[])
{
    char **ring;
    char line[MAXLEN];
    long count = 0, i, first;
    int n = DEFLINES;

    if (argc > 1 && argv[1][0] == '-')
        n = atoi(argv[1] + 1);
    if (n < 1)
        n = DEFLINES;

    /* calloc fills the slots with zero bits, which is NULL here, so
       freeing an empty slot later is harmless. */
    ring = calloc(n, sizeof *ring);
    if (ring == NULL)
        return 1;

    while (fgets(line, sizeof line, stdin) != NULL) {
        char **slot = &ring[count % n];
        free(*slot);                       /* drop the oldest line */
        *slot = malloc(strlen(line) + 1);
        if (*slot == NULL)
            return 1;
        strcpy(*slot, line);
        count++;
    }

    /* The oldest surviving line is in slot count % n once the ring has
       wrapped, and in slot 0 if it has not. */
    first = count > n ? count - n : 0;
    printf("last %ld of %ld lines:\n", count - first, count);
    for (i = first; i < count; i++)
        fputs(ring[i % n], stdout);

    for (i = 0; i < n; i++)
        free(ring[i]);
    free(ring);
    return 0;
}

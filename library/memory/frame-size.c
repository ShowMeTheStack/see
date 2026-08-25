/*
 * title: How much stack does one call cost?
 * level: 3
 * about: Recurses to a given depth, records the address of a local in every frame and works out how many bytes each frame takes, with and without a big local array.
 * input: 6
 */
#include <stdio.h>

#define MAXDEPTH 20

static char *mark_small[MAXDEPTH];
static char *mark_big[MAXDEPTH];

/* A frame holding just an int (plus the return address and saved registers). */
static int small(int n)
{
    char here = 's';
    mark_small[n] = &here;
    if (n == 0)
        return here;
    return small(n - 1) + 1;
}

/* The same function with a 100-byte array: its frames must be bigger. */
static int big(int n)
{
    char pad[100];
    pad[0] = 'b';
    mark_big[n] = pad;
    if (n == 0)
        return pad[0];
    return big(n - 1) + 1;
}

int main(void)
{
    int depth, i;

    if (scanf("%d", &depth) != 1 || depth < 2 || depth >= MAXDEPTH)
        return 0;

    small(depth);
    big(depth);

    /*
     * The pointers in mark_small still hold the addresses the frames used,
     * even though the frames are gone. We only subtract them; we never
     * follow them, because the memory no longer belongs to anyone.
     */
    printf("depth   small frame   big frame\n");
    for (i = depth; i >= 0; i--)
        printf("%5d   %p    %p\n", i, (void *)mark_small[i], (void *)mark_big[i]);

    printf("\none small() frame: %ld bytes\n", (long)(mark_small[1] - mark_small[0]));
    printf("one big() frame:   %ld bytes\n", (long)(mark_big[1] - mark_big[0]));

    /*
     * Pause inside big() at depth 0 with a breakpoint and look at the stack
     * panel: seven frames stacked on top of each other, each with its own pad.
     * Recursing a million times would run off the end of the stack, which is
     * why deep recursion with big locals is dangerous.
     */
    return 0;
}

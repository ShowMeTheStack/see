/*
 * title: A map of memory: one variable in every segment
 * level: 2
 * about: Puts something in each region of memory (code, string literals, globals, the heap, the stack) and prints their addresses from low to high.
 */
#include <stdio.h>
#include <stdlib.h>

/* An initialised global lives in the data segment. */
int initialised_global = 42;

/* A global with no initialiser lives in .bss and starts out as zero. */
int zero_global;

/* A function: its machine code lives in the text (code) segment. */
int square(int x)
{
    return x * x;
}

/* One entry of the table we sort and print at the end. */
struct place {
    const char *name;
    unsigned long addr;
};

static void sort_places(struct place *p, int n)
{
    int i, j;
    struct place t;

    /* Insertion sort by address: small, and good enough for seven entries. */
    for (i = 1; i < n; i++) {
        t = p[i];
        for (j = i - 1; j >= 0 && p[j].addr > t.addr; j--)
            p[j + 1] = p[j];
        p[j + 1] = t;
    }
}

int main(void)
{
    int local = 7;                      /* on the stack, in main's frame */
    const char *literal = "I am a string literal";
    int *heap = malloc(sizeof *heap);   /* a block on the heap */
    struct place places[6];
    int i;

    if (heap == NULL)
        return 0;
    *heap = square(local);

    /*
     * Converting an address to unsigned long is not something portable code
     * relies on, but on See's 32-bit machine it lets us sort the addresses
     * as plain numbers.
     */
    places[0].name = "code: square()";        places[0].addr = (unsigned long)square;
    places[1].name = "string literal";        places[1].addr = (unsigned long)literal;
    places[2].name = "initialised global";    places[2].addr = (unsigned long)&initialised_global;
    places[3].name = "zero global (.bss)";    places[3].addr = (unsigned long)&zero_global;
    places[4].name = "heap block";            places[4].addr = (unsigned long)heap;
    places[5].name = "local in main";         places[5].addr = (unsigned long)&local;

    sort_places(places, 6);

    /*
     * Expect the classic picture: code lowest, then read-only literals, then
     * the globals, then the heap, and far above all of them, the stack.
     */
    printf("%-22s %s\n", "where", "address");
    for (i = 0; i < 6; i++)
        printf("%-22s 0x%08lx\n", places[i].name, places[i].addr);

    printf("\nsquare(%d) = %d, stored on the heap\n", local, *heap);
    printf("zero_global starts as %d without being set\n", zero_global);

    /* Open the memory panel in See before this line to see all of them at once. */
    free(heap);
    return 0;
}

/*
 * title: Memory, the pairs game
 * level: 2
 * about: Deals eight shuffled pairs face down on a 4x4 table; each turn you turn over two cards by number, and matching pairs stay face up.
 * input: 1 2\n3 4\n5 3\n3 5\n6 7\n4 7\n8 9\n6 9\n10 11\n12 10\n13 8\n14 2\n15 1\n16 11\n
 */
#include <stdio.h>
#include <stdlib.h>

#define CARDS 16

struct card {
    char face;      /* A..H, two of each */
    int up;         /* 1 once the pair is found */
};

static struct card table[CARDS];

/* Show the table. The two cards being looked at this turn are shown
   face up even though they are not matched yet. */
static void show(int a, int b)
{
    int i;

    for (i = 0; i < CARDS; i++) {
        if (table[i].up || i == a || i == b)
            printf("  %c ", table[i].face);
        else
            printf(" %2d ", i + 1);
        if (i % 4 == 3)
            printf("\n");
    }
}

int main(void)
{
    struct card t;
    int i, j, a, b, pairs = 0, turns = 0;

    for (i = 0; i < CARDS; i++) {
        table[i].face = (char)('A' + i / 2);
        table[i].up = 0;
    }
    /* Shuffle whole structs: the assignment t = table[i] copies every
       field at once. */
    srand(16);
    for (i = CARDS - 1; i > 0; i--) {
        j = rand() % (i + 1);
        t = table[i];
        table[i] = table[j];
        table[j] = t;
    }

    show(-1, -1);
    while (pairs < CARDS / 2) {
        if (scanf("%d %d", &a, &b) != 2) {
            printf("stopped with %d pairs\n", pairs);
            return 0;
        }
        printf("\nturn over %d and %d\n", a, b);
        a--;
        b--;
        if (a < 0 || a >= CARDS || b < 0 || b >= CARDS || a == b ||
            table[a].up || table[b].up) {
            printf("pick two different face-down cards\n");
            continue;
        }
        turns++;
        show(a, b);
        if (table[a].face == table[b].face) {
            table[a].up = table[b].up = 1;
            pairs++;
            printf("a pair of %c's!\n", table[a].face);
        } else {
            printf("no match\n");
        }
    }
    printf("\nAll %d pairs in %d turns.\n", pairs, turns);
    return 0;
}

/*
 * title: Which function is this pointer?
 * level: 2
 * about: Compares function pointers by address to recognise them, finds a function's name in a lookup table, and counts how often each one was chosen.
 */
#include <stdio.h>
#include <stdlib.h>

int rock(void)     { return 0; }
int paper(void)    { return 1; }
int scissors(void) { return 2; }

typedef int (*move)(void);

/* A table that maps addresses back to names, like a tiny symbol table. */
struct named {
    move fn;
    const char *name;
    int times;
};

struct named known[] = {
    { rock, "rock", 0 }, { paper, "paper", 0 }, { scissors, "scissors", 0 }
};
#define NKNOWN 3

/*
 * Two function pointers are equal exactly when they point at the same
 * function. That is all == can tell you: there is no meaningful "less
 * than" between functions, and printing the address only shows where
 * the code happens to live.
 */
struct named *lookup(move m)
{
    int i;
    for (i = 0; i < NKNOWN; i++)
        if (known[i].fn == m)
            return &known[i];
    return NULL;
}

/* Does a beat b? Uses the return values: each beats the one before it. */
int beats(move a, move b)
{
    return (a() - b() + 3) % 3 == 1;
}

int main(void)
{
    move me, you;
    struct named *n1, *n2;
    int round;

    srand(5);
    for (round = 1; round <= 6; round++) {
        me = known[rand() % 3].fn;
        you = known[rand() % 3].fn;
        n1 = lookup(me);
        n2 = lookup(you);
        n1->times++;
        n2->times++;
        printf("round %d: %-8s vs %-8s  ", round, n1->name, n2->name);
        if (me == you)
            printf("same function, a draw\n");
        else if (beats(me, you))
            printf("%s wins\n", n1->name);
        else
            printf("%s wins\n", n2->name);
    }

    printf("times played:");
    for (round = 0; round < NKNOWN; round++)
        printf(" %s %d", known[round].name, known[round].times);
    printf("\n");

    /* A pointer that matches nothing in the table: */
    if (lookup((move)NULL) == NULL)
        printf("a null function pointer is not any known move\n");
    return 0;
}

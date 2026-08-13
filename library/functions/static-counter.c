/*
 * title: A static local that remembers
 * level: 2
 * about: Compares an ordinary local counter, which restarts on every call, with a static one that keeps counting.
 */
#include <stdio.h>

void visit(const char *who)
{
    /* fresh is an automatic variable: it is created in this call's
       stack frame and destroyed when the call returns. */
    int fresh = 0;

    /* kept is static: it lives with the globals, outside any frame,
       for the whole run. Its initialiser runs once, before main. */
    static int kept = 0;

    fresh = fresh + 1;
    kept = kept + 1;

    /* In See, fresh appears in visit's frame, but kept is drawn with the
       globals, outside the stack. Watch it survive each return. */
    printf("%-6s fresh = %d   kept = %d\n", who, fresh, kept);
}

/* A classic use: a function that hands out unique ticket numbers
   without a global variable anyone else could tamper with. */
int next_ticket(void)
{
    static int last = 100;

    last = last + 1;
    return last;
}

int main(void)
{
    int i;

    visit("Ana");
    visit("Ben");
    visit("Chen");

    printf("\ntickets:");
    for (i = 0; i < 5; i++)
        printf(" %d", next_ticket());
    printf("\n");
    return 0;
}

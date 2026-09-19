/* getch.c: getchar with an undo. ungetch puts characters into buf, and
   getch takes from buf before it reads anything new. */
#include <stdio.h>
#include "calc.h"

#define BUFSIZE 100

static char buf[BUFSIZE];   /* characters pushed back */
static int bufp = 0;        /* next free slot in buf */

int getch(void)
{
    return (bufp > 0) ? buf[--bufp] : getchar();
}

void ungetch(int c)
{
    if (bufp >= BUFSIZE)
        printf("ungetch: too many characters\n");
    else
        buf[bufp++] = (char)c;
}

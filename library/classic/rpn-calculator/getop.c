/* getop.c: cut the input into tokens. */
#include <stdio.h>
#include <ctype.h>
#include "calc.h"

/* Get the next operator or number. A number is copied into s and
   NUMBER is returned; anything else is returned as itself.

   To know a number has ended, getop must read one character past it,
   e.g. the space or the '+' after "12". That character belongs to the
   next token, so it is pushed back with ungetch, and the next call to
   getch will hand it out again. */
int getop(char s[])
{
    int i, c;

    while ((s[0] = (char)(c = getch())) == ' ' || c == '\t')
        ;                                /* skip blanks */
    s[1] = '\0';
    if (!isdigit(c) && c != '.')
        return c;                        /* not a number */
    i = 0;
    if (isdigit(c))                      /* the whole part */
        while (isdigit(s[++i] = (char)(c = getch())))
            ;
    if (c == '.')                        /* the fraction */
        while (isdigit(s[++i] = (char)(c = getch())))
            ;
    s[i] = '\0';
    if (c != EOF)
        ungetch(c);                      /* one too far: give it back */
    return NUMBER;
}

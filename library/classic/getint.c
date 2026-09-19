/*
 * title: getint, returning through a pointer
 * level: 2
 * about: Reads integers from free-form input with getch and ungetch, returning each value through a pointer and the status as the result.
 * input: 12  -7 +300\nabc 42\n- 5 0\n
 */
#include <stdio.h>
#include <ctype.h>

#define BUFSIZE 10
#define SIZE 10

static char buf[BUFSIZE];
static int bufp = 0;

int getch(void)
{
    return (bufp > 0) ? buf[--bufp] : getchar();
}

void ungetch(int c)
{
    if (bufp < BUFSIZE)
        buf[bufp++] = (char)c;
}

/* A function returns only one value, but getint has two things to say:
   the number, and whether there was one. So the number goes out through
   pn, a pointer to the caller's variable, and the return value says EOF,
   0 (not a number) or positive (got one).

   Step into getint and look at pn: its arrow points to an element of
   main's array. *pn = ... writes straight into that element. */
int getint(int *pn)
{
    int c, sign, next;

    while (isspace(c = getch()))
        ;
    if (c == EOF)
        return EOF;
    if (!isdigit(c) && c != '+' && c != '-') {
        ungetch(c);         /* not a number: leave it for the caller */
        return 0;
    }
    sign = (c == '-') ? -1 : 1;
    if (c == '+' || c == '-') {
        /* Exercise 5-1: a sign not followed by a digit is not a number.
           Push the sign back too, so nothing is lost. */
        next = getch();
        if (!isdigit(next)) {
            if (next != EOF)
                ungetch(next);
            ungetch(c);
            return 0;
        }
        c = next;
    }
    for (*pn = 0; isdigit(c); c = getch())
        *pn = 10 * *pn + (c - '0');
    *pn *= sign;
    if (c != EOF)
        ungetch(c);
    /* The book returns c here, but then a number right at the end of
       the input would be reported as EOF and lost. 1 means "got one". */
    return 1;
}

int main(void)
{
    int array[SIZE], n, i, r, junk;

    for (n = 0; n < SIZE && (r = getint(&array[n])) != EOF; ) {
        if (r != 0) {
            n++;
        } else {
            /* Something that is not a number: throw one character away,
               or getint would see it again and loop for ever. */
            junk = getch();
            printf("skipped '%c'\n", junk);
        }
    }
    printf("%d numbers:", n);
    for (i = 0; i < n; i++)
        printf(" %d", array[i]);
    printf("\n");
    return 0;
}

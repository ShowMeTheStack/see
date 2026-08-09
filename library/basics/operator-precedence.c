/*
 * title: Which operator goes first?
 * level: 2
 * about: Works through expressions where precedence and associativity decide the answer, each printed next to its fully bracketed form.
 */
#include <stdio.h>

int main(void)
{
    int a = 2, b = 3, c = 4;
    int x;

    /*
     * Like school arithmetic, * / % are done before + and -. Each line
     * prints the expression as written and as C reads it.
     */
    printf("2 + 3 * 4       = %2d   same as 2 + (3 * 4)\n", a + b * c);
    printf("(2 + 3) * 4     = %2d\n", (a + b) * c);

    /* Operators of the same level are grouped left to right. That matters
       for - and /, where the order changes the answer. */
    printf("20 - 6 - 4      = %2d   same as (20 - 6) - 4\n", 20 - 6 - 4);
    printf("100 / 10 / 5    = %2d   same as (100 / 10) / 5\n", 100 / 10 / 5);
    printf("17 %% 5 * 2      = %2d   same as (17 %% 5) * 2\n", 17 % 5 * 2);

    /* Unary minus binds tighter than anything else here. */
    printf("-2 * -3         = %2d\n", -a * -b);

    /* Comparisons come after arithmetic, and && comes after comparisons,
       so this needs no brackets at all. It is 1 (true) or 0 (false). */
    printf("a + b > c && c > a = %d\n", a + b > c && c > a);

    /* || is lower than &&: 1 || 0 && 0 means 1 || (0 && 0). The brackets
       are written in anyway, as compilers suggest; the second line shows
       how different the other grouping is. */
    printf("1 || (0 && 0)   = %d\n", 1 || (0 && 0));
    printf("(1 || 0) && 0   = %d\n", (1 || 0) && 0);

    /*
     * Assignment is right to left and almost the lowest of all, so
     * x = a = 5 sets a to 5, then x to the value of that assignment.
     * Here a is changed; watch it on the stack.
     */
    x = a = 5;
    printf("x = a = 5      -> x = %d, a = %d\n", x, a);

    /*
     * A famous surprise: the bitwise & is below ==. Written without
     * brackets, the test "is x even?" as x & 1 == 0 means x & (1 == 0),
     * which is x & 0, always 0. Both groupings are written out here so
     * the difference shows (and the compiler has nothing to warn about).
     */
    x = 6;
    printf("x & (1 == 0)    = %d   but (x & 1) == 0 is %d\n", x & (1 == 0), (x & 1) == 0);

    /* When in doubt, add brackets: they cost nothing and help the reader. */
    return 0;
}

/*
 * title: ++, -- and compound assignment
 * level: 2
 * about: Shows the difference between i++ and ++i, and the shorthand operators +=, -=, *=, /= and %=.
 */
#include <stdio.h>

int main(void)
{
    int i = 5;
    int j;
    int n;

    /*
     * Both i++ and ++i add one to i. They differ in the value the
     * expression itself has: i++ is the old value, ++i is the new one.
     */
    j = i++;
    printf("j = i++   gives j = %d, i = %d\n", j, i);

    i = 5;
    j = ++i;
    printf("j = ++i   gives j = %d, i = %d\n", j, i);

    i = 5;
    j = i--;
    printf("j = i--   gives j = %d, i = %d\n", j, i);

    i = 5;
    j = --i;
    printf("j = --i   gives j = %d, i = %d\n", j, i);

    /*
     * On a line of its own, i++ and ++i do exactly the same thing, because
     * nobody looks at the value. That is how they are used most of the
     * time, for example in for loops.
     *
     * Do not use the same variable twice in one expression with ++, as in
     * i = i++ or printf("%d %d", i, i++). C does not say what happens.
     */

    /* Compound assignment: n op= x means n = n op x. */
    n = 100;
    n += 20;  printf("n += 20   -> %d\n", n);
    n -= 5;   printf("n -= 5    -> %d\n", n);
    n *= 3;   printf("n *= 3    -> %d\n", n);
    n /= 7;   printf("n /= 7    -> %d\n", n);
    n %= 10;  printf("n %%= 10   -> %d\n", n);

    /* The right-hand side is worked out first, as a whole:
       n *= 2 + 3 is n = n * (2 + 3), not n * 2 + 3. */
    n = 4;
    n *= 2 + 3;
    printf("n = 4; n *= 2 + 3 -> %d\n", n);
    return 0;
}

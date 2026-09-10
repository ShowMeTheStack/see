/*
 * title: Quotient and remainder together with div and ldiv
 * level: 1
 * about: Uses div and ldiv to turn seconds into days, hours, minutes and seconds, make change, and show how negative numbers divide.
 */
#include <stdio.h>
#include <stdlib.h>

/*
 * div(a, b) returns a struct div_t holding both a / b (quot) and a % b
 * (rem). ldiv does the same for long. Doing both at once is handy, and
 * in C89 div also pins down the rounding for negative numbers, which
 * plain / and % left up to the compiler: the quotient goes towards zero.
 */
int main(void)
{
    long total = 200000L;          /* seconds */
    ldiv_t d;
    div_t r;
    int amount = 187;              /* pence */
    int coins[6];
    int i;
    int pairs[4][2];

    /* Peel off units from the largest down. */
    d = ldiv(total, 86400L);
    printf("%ld seconds = %ld days", total, d.quot);
    d = ldiv(d.rem, 3600L);
    printf(", %ld hours", d.quot);
    d = ldiv(d.rem, 60L);
    printf(", %ld minutes, %ld seconds\n", d.quot, d.rem);

    /* Making change with the fewest coins. */
    coins[0] = 100; coins[1] = 50; coins[2] = 20;
    coins[3] = 10;  coins[4] = 5;  coins[5] = 1;
    printf("%dp in coins:", amount);
    for (i = 0; i < 6; i++) {
        r = div(amount, coins[i]);
        if (r.quot > 0)
            printf(" %d x %dp", r.quot, coins[i]);
        amount = r.rem;
    }
    printf("\n");

    /* The rule always holds: quot * b + rem == a. */
    pairs[0][0] = 17;  pairs[0][1] = 5;
    pairs[1][0] = -17; pairs[1][1] = 5;
    pairs[2][0] = 17;  pairs[2][1] = -5;
    pairs[3][0] = -17; pairs[3][1] = -5;
    for (i = 0; i < 4; i++) {
        r = div(pairs[i][0], pairs[i][1]);
        printf("div(%3d, %2d): quot %2d, rem %2d, check %d\n",
               pairs[i][0], pairs[i][1], r.quot, r.rem,
               r.quot * pairs[i][1] + r.rem);
    }

    /* abs and labs, the integer absolute values, also live in stdlib.h. */
    printf("abs(-42) = %d, labs(-100000) = %ld\n", abs(-42), labs(-100000L));

    /*
     * In See, r and d are small structs in main's frame: two ints side
     * by side. Each call fills both members in one go.
     */
    return 0;
}

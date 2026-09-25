/*
 * title: Shipping costs that fall through
 * level: 1
 * about: Adds up shipping charges by parcel size with a switch that is missing its break statements.
 */

/*
 * THE PUZZLE
 * This program runs to the end without any complaint from See, and its
 * answer is wrong. That makes it the hardest kind of bug: only you know
 * what the right answer is.
 *
 * Small parcels cost 3, medium 5, large 8. The orders are S, M, L, S,
 * so the total should be 3 + 5 + 8 + 3 = 19.
 *
 *   expected:  S 3, M 5, L 8, S 3, total 19
 *   actual:    S 16, M 13, L 8, S 16, total 53
 *
 * HOW TO HUNT IT WITH SEE
 * Put a breakpoint on the switch line (F9), run with F5, then step with
 * F10 for the first parcel. The highlighted line goes to case 'S', adds
 * 3, and then carries straight on into case 'M' and case 'L'. A case
 * label is only a place to jump to; it does not end the code before it.
 */
#include <stdio.h>

static int cost(char size)
{
    int c = 0;

    switch (size) {
    case 'S':
        c += 3;
    case 'M':
        c += 5;
    case 'L':
        c += 8;
        break;
    default:
        printf("unknown size %c\n", size);
    }
    return c;
}

int main(void)
{
    const char *orders = "SMLS";
    int i, total = 0, c;

    for (i = 0; orders[i] != '\0'; i++) {
        c = cost(orders[i]);
        printf("%c %d\n", orders[i], c);
        total += c;
    }
    printf("total %d\n", total);
    return 0;
}

/*
 * THE FIX
 * End every case with break (or return). When falling through is what
 * you really want, which is sometimes useful, say so in a comment such
 * as "falls through" so the next reader knows it was on purpose.
 */

/*
 * title: The Luhn checksum
 * level: 2
 * about: Checks card-style numbers with the Luhn algorithm, shows the digit doubling, and works out the missing check digit.
 * input: 4539 1488 0343 6467\n4539 1488 0343 6468\n79927398713\n7992739871\n
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* The Luhn sum: from the rightmost digit leftwards, double every second
   digit; if doubling gives two digits, add them (or subtract 9, which is
   the same thing). A valid number has a sum divisible by 10. It catches
   any single wrong digit and most swaps of neighbours. */
int luhn_sum(const char *digits, int len, int verbose)
{
    int i, d, sum = 0, doubled = 0;

    for (i = len - 1; i >= 0; i--) {
        d = digits[i] - '0';
        if (doubled) {
            d *= 2;
            if (d > 9)
                d -= 9;
        }
        if (verbose)
            printf("%c->%d ", digits[i], d);
        sum += d;
        doubled = !doubled;
    }
    if (verbose)
        printf("\n");
    return sum;
}

int main(void)
{
    char line[80], digits[80];
    int i, len, sum, check;

    while (fgets(line, sizeof line, stdin) != NULL) {
        /* Keep only the digits, so spaces between groups do not matter. */
        len = 0;
        for (i = 0; line[i] != '\0'; i++)
            if (isdigit((unsigned char)line[i]))
                digits[len++] = line[i];
        digits[len] = '\0';
        if (len == 0)
            continue;

        printf("%s\n  ", digits);
        sum = luhn_sum(digits, len, 1);
        printf("  sum %d: %s\n", sum, sum % 10 == 0 ? "valid" : "invalid");

        /* Now treat the whole line as a number still waiting for its
           check digit. Which digit, appended on the right, would make
           it valid? Append a 0 as a stand-in so the doubling lines up,
           then pick the digit that brings the sum to a multiple of 10. */
        digits[len] = '0';
        digits[len + 1] = '\0';
        sum = luhn_sum(digits, len + 1, 0);
        check = (10 - sum % 10) % 10;
        printf("  to extend it with a check digit, append %d\n", check);
    }
    return 0;
}

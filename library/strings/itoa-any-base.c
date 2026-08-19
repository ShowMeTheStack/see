/*
 * title: Writing a number in any base
 * level: 2
 * about: Converts integers into text in bases 2 to 36 by taking remainders, filling the buffer from the right-hand end.
 */
#include <stdio.h>

/* Digits are produced least significant first (the remainder by base is
   the last digit), so it is easiest to write them backwards from the end
   of the buffer and return a pointer to wherever the number starts.
   In See, the returned pointer lands part way into buf, not at buf[0]. */
static char *to_base(unsigned long n, int base, char *buf, int size)
{
    const char *digits = "0123456789abcdefghijklmnopqrstuvwxyz";
    char *p = buf + size - 1;
    *p = '\0';
    do {
        *--p = digits[n % base];
        n /= base;
    } while (n > 0);   /* do-while so that 0 still prints one digit */
    return p;
}

int main(void)
{
    /* Base 2 is the longest: 32 binary digits plus the NUL. */
    char buf[33];
    unsigned long values[5] = { 0, 10, 255, 2026, 4294967295UL };
    int bases[5] = { 2, 8, 16, 20, 36 };
    int i, j;

    printf("%10s", "");
    for (j = 0; j < 5; j++)
        printf(" %10s%-2d", "base ", bases[j]);
    printf("\n");
    for (i = 0; i < 5; i++) {
        printf("%10lu", values[i]);
        for (j = 0; j < 5; j++) {
            if (bases[j] == 2 && values[i] > 255)
                printf(" %12s", "(long)");
            else
                printf(" %12s", to_base(values[i], bases[j], buf, (int)sizeof buf));
        }
        printf("\n");
    }
    printf("4294967295 in binary: %s\n", to_base(4294967295UL, 2, buf, (int)sizeof buf));
    /* The library check: printf can do bases 8 and 16 itself. */
    printf("printf agrees: %lo and %lx\n", 2026UL, 2026UL);
    return 0;
}

/*
 * title: Printing a number in any base
 * level: 2
 * about: Prints numbers in bases 2 to 36 by recursing on the quotient before printing the last digit, so the digits come out in the right order.
 */
#include <stdio.h>

static const char digits[] = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* Dividing by the base gives the last digit first (the remainder), but
   we want to print it last. Recursion solves this: first print
   everything except the last digit (the quotient, recursively), and
   only then print the last digit. The frames hold the digits for us on
   the way back up, like a stack of plates. */
void print_base(unsigned long n, unsigned int base)
{
    if (n >= base)
        print_base(n / base, base);
    putchar(digits[n % base]);
}

/* For comparison: the same digits come out backwards with a loop,
   unless we store them first. */
void print_backwards(unsigned long n, unsigned int base)
{
    do {
        putchar(digits[n % base]);
        n /= base;
    } while (n > 0);
}

/* Signed numbers: print the sign, then the magnitude. */
void print_signed(long n, unsigned int base)
{
    if (n < 0) {
        putchar('-');
        print_base(0UL - (unsigned long)n, base);   /* safe even for LONG_MIN */
    } else
        print_base((unsigned long)n, base);
}

int main(void)
{
    unsigned int b;

    printf("2024 in every base from 2 to 16:\n");
    for (b = 2; b <= 16; b++) {
        printf("  base %2u: ", b);
        print_base(2024UL, b);
        printf("\n");
    }

    printf("\n255 in base 2 by loop (backwards): ");
    print_backwards(255UL, 2);
    printf("\n1000 in base 2 by recursion:       ");
    print_base(1000UL, 2);   /* set a breakpoint on putchar: 10 frames deep */
    printf("\n1000 in base 2 by loop (backwards): ");
    print_backwards(1000UL, 2);

    printf("\n\nbase 36 spells words: ");
    print_base(29234652UL, 36);
    printf(" ");
    print_base(54903217UL, 36);
    printf("\n-255 in hex: ");
    print_signed(-255L, 16);
    printf("\n");
    return 0;
}

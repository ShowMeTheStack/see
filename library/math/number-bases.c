/*
 * title: Converting between number bases
 * level: 2
 * about: Reads a number and a base, writes the number in that base with a recursive function, and reads it back with strtol.
 * input: 255 2\n255 16\n2024 8\n-100 3\n1295 36\n0 0
 */
#include <stdio.h>
#include <stdlib.h>

/* The digit for value d is symbols[d]. symbols is a pointer to a string
   literal, so look for the text in the string literals panel. */
static const char *symbols = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* Print n in base b. The last digit is n % b, but it has to be printed
   last, so first print everything in front of it (n / b) by calling
   ourselves. Step in with F11 on a big number and the stack panel
   shows one frame per digit, each waiting to print its own. */
void print_base(unsigned long n, int b)
{
    if (n >= (unsigned long)b)
        print_base(n / b, b);
    putchar(symbols[n % b]);
}

/* The same thing without recursion: fill a buffer from the right end,
   then return a pointer to where the digits start. buf is in main's
   frame; watch the returned pointer land in the middle of it. */
char *to_base(long value, int b, char *buf, int size)
{
    char *p = buf + size - 1;
    unsigned long n;
    int negative = value < 0;

    /* Make n the size of value without overflowing on LONG_MIN. */
    n = negative ? 0UL - (unsigned long)value : (unsigned long)value;
    *p = '\0';
    do {
        *--p = symbols[n % b];
        n /= b;
    } while (n > 0);
    if (negative)
        *--p = '-';
    return p;
}

int main(void)
{
    long n;
    int b;
    char buf[40];
    char *text;

    while (scanf("%ld %d", &n, &b) == 2 && b >= 2 && b <= 36) {
        text = to_base(n, b, buf, sizeof buf);
        printf("%ld in base %d is %s", n, b, text);
        if (n >= 0) {
            printf(" (recursive: ");
            print_base((unsigned long)n, b);
            printf(")");
        }
        /* strtol does the opposite journey, text back to number. */
        printf(", strtol reads it back as %ld\n", strtol(text, NULL, b));
    }
    /* printf can do 8 and 16 by itself. */
    printf("printf knows two of them: %o octal, %X hex, %#x with prefix\n",
           255, 255, 255);
    return 0;
}

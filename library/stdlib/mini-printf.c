/*
 * title: Writing a small printf from scratch
 * level: 4
 * about: Implements my_printf with stdarg.h and putchar, supporting %d, %u, %x, %c, %s, %% and a field width for numbers, by converting numbers to digits itself.
 */
#include <stdio.h>
#include <stdarg.h>

/*
 * Print an unsigned number in a base, right-aligned in width columns.
 * Digits come out lowest first, so they are collected in a small
 * buffer and printed backwards.
 */
static int put_number(unsigned long v, unsigned base, int negative, int width)
{
    char digits[12];
    int n = 0, count = 0;

    do {
        digits[n++] = "0123456789abcdef"[v % base];
        v /= base;
    } while (v != 0);
    if (negative)
        digits[n++] = '-';

    for (; width > n; width--) {
        putchar(' ');
        count++;
    }
    while (n > 0) {
        putchar(digits[--n]);
        count++;
    }
    return count;
}

/* Returns the number of characters written, like the real printf. */
static int my_printf(const char *fmt, ...)
{
    va_list ap;
    int count = 0, width;
    const char *s;
    int d;

    va_start(ap, fmt);
    for (; *fmt != '\0'; fmt++) {
        if (*fmt != '%') {
            putchar(*fmt);
            count++;
            continue;
        }
        fmt++;                       /* step past the % */
        width = 0;
        while (*fmt >= '0' && *fmt <= '9')
            width = width * 10 + (*fmt++ - '0');

        switch (*fmt) {
        case 'd':
            d = va_arg(ap, int);
            /*
             * Negate as unsigned long, not as int: -INT_MIN does not fit
             * in an int, but its magnitude does fit in an unsigned long.
             */
            if (d < 0)
                count += put_number(0UL - (unsigned long)d, 10, 1, width);
            else
                count += put_number((unsigned long)d, 10, 0, width);
            break;
        case 'u':
            count += put_number(va_arg(ap, unsigned), 10, 0, width);
            break;
        case 'x':
            count += put_number(va_arg(ap, unsigned), 16, 0, width);
            break;
        case 'c':
            putchar(va_arg(ap, int));   /* a char arrives promoted to int */
            count++;
            break;
        case 's':
            for (s = va_arg(ap, const char *); *s; s++) {
                putchar(*s);
                count++;
            }
            break;
        case '%':
            putchar('%');
            count++;
            break;
        case '\0':
            fmt--;                   /* a lone % at the very end */
            break;
        default:
            putchar('?');            /* unknown conversion */
            count++;
        }
    }
    va_end(ap);
    return count;
}

int main(void)
{
    int n;

    my_printf("plain text, no conversions\n");
    my_printf("%d + %d = %d\n", 19, 23, 19 + 23);
    my_printf("negative: %d, zero: %d\n", -273, 0);
    my_printf("hex of 48879 is %x, unsigned max is %u\n", 48879u, 4294967295u);
    my_printf("[%5d] [%3s] [%8x]\n", 42, "abc", 255u);
    my_printf("char %c, string \"%s\", percent %%\n", 'Z', "hello");
    my_printf("smallest int: %d\n", -2147483647 - 1);
    n = my_printf("this line is how long?\n");
    my_printf("that was %d characters\n", n);

    /* Compare with the real thing. */
    printf("[%5d] [%3s] [%8x]\n", 42, "abc", 255u);

    /*
     * Step into my_printf in See and watch fmt walk along the format
     * literal while ap moves up through the arguments in main's call.
     */
    return 0;
}

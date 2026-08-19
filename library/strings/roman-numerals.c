/*
 * title: Roman numerals both ways
 * level: 2
 * about: Converts numbers to Roman numerals with a table of values and symbols, and reads them back using the subtract-if-smaller rule.
 * input: 4 9 14 40 90 400 1994 2026 3999
 */
#include <stdio.h>
#include <string.h>

/* Parallel tables, largest first. Including the six subtractive pairs
   (CM, CD, XC, XL, IX, IV) means the greedy method below never has to
   think about subtraction at all. */
static const int value[13] = { 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1 };
static const char *symbol[13] = { "M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I" };

static void to_roman(int n, char *out)
{
    int i;
    out[0] = '\0';
    for (i = 0; i < 13; i++)
        while (n >= value[i]) {   /* take the biggest piece that still fits */
            strcat(out, symbol[i]);
            n -= value[i];
        }
}

static int letter(char c)
{
    switch (c) {
    case 'I': return 1;    case 'V': return 5;    case 'X': return 10;
    case 'L': return 50;   case 'C': return 100;  case 'D': return 500;
    case 'M': return 1000;
    }
    return 0;
}

/* A letter smaller than the one after it is subtracted (the I in IV),
   otherwise it is added. */
static int from_roman(const char *s)
{
    int total = 0, v;
    for (; *s; s++) {
        v = letter(*s);
        if (letter(s[1]) > v)   /* s[1] is the NUL at the end, worth 0 */
            total -= v;
        else
            total += v;
    }
    return total;
}

int main(void)
{
    /* 3999 is MMMCMXCIX, 9 letters; the longest under 4000 is 3888,
       MMMDCCCLXXXVIII, 15 letters. 16 bytes would do; 20 is comfortable. */
    char r[20];
    int n;

    while (scanf("%d", &n) == 1) {
        if (n < 1 || n > 3999) {
            printf("%d: out of range\n", n);
            continue;
        }
        to_roman(n, r);
        printf("%5d = %-12s and back = %d\n", n, r, from_roman(r));
    }
    return 0;
}

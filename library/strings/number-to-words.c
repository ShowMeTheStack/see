/*
 * title: Cheque writer: any int in words
 * level: 3
 * about: Spells out any int in English words, like a cheque writer, using tables of string literals and a buffer built up with strcat.
 * input: 0 7 13 40 99 105 1000 2026 70001 1234567 -2147483647
 */
#include <stdio.h>
#include <string.h>

static const char *ones[20] = {
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
    "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
    "seventeen", "eighteen", "nineteen"
};
static const char *tens[10] = {
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"
};

/* Append the words for 1..999 to out. */
static void below_thousand(int n, char *out)
{
    if (n >= 100) {
        strcat(out, ones[n / 100]);
        strcat(out, " hundred");
        n %= 100;
        if (n)
            strcat(out, " and ");
    }
    if (n >= 20) {
        strcat(out, tens[n / 10]);
        if (n % 10) {
            strcat(out, "-");
            strcat(out, ones[n % 10]);
        }
    } else if (n > 0) {
        strcat(out, ones[n]);
    }
}

/* Split the number into groups of three digits, biggest first. Using an
   unsigned long for the magnitude lets -2147483648 work too, since its
   positive value does not fit in an int. */
static void in_words(long value, char *out)
{
    static const char *scale[4] = { "billion", "million", "thousand", "" };
    unsigned long n, group, div = 1000000000UL;
    int s, first = 1;

    out[0] = '\0';
    if (value == 0) {
        strcpy(out, "zero");
        return;
    }
    if (value < 0) {
        strcat(out, "minus ");
        n = 0UL - (unsigned long)value;
    } else {
        n = (unsigned long)value;
    }
    for (s = 0; s < 4; s++, div /= 1000) {
        group = n / div;
        n %= div;
        if (group == 0)
            continue;
        if (!first)
            strcat(out, group < 100 && s == 3 ? " and " : ", ");
        below_thousand((int)group, out);
        if (*scale[s]) {
            strcat(out, " ");
            strcat(out, scale[s]);
        }
        first = 0;
    }
}

int main(void)
{
    /* The longest result is about 140 characters; 256 leaves room. */
    char words[256];
    long x;

    while (scanf("%ld", &x) == 1) {
        in_words(x, words);
        printf("%11ld  %s\n", x, words);
    }
    return 0;
}

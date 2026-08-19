/*
 * title: Turning text into a number by hand
 * level: 2
 * about: Converts strings like "-42" to int digit by digit, handling spaces, signs, junk and overflow, and compares with atoi and strtol.
 */
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <limits.h>

/* Returns 1 on success and stores the value; returns 0 for empty input,
   junk after the digits, or a value that does not fit in an int. */
static int parse_int(const char *s, int *out)
{
    int negative = 0, any = 0, d;
    unsigned long v = 0;      /* the size of the number, sign kept apart */
    unsigned long limit;

    while (isspace((unsigned char)*s))
        s++;
    if (*s == '+' || *s == '-') {
        negative = (*s == '-');
        s++;
    }
    /* The negative side reaches one further than the positive side:
       INT_MIN is -2147483648 but INT_MAX is 2147483647. */
    limit = negative ? (unsigned long)INT_MAX + 1 : (unsigned long)INT_MAX;

    while (isdigit((unsigned char)*s)) {
        d = *s - '0';   /* '7' - '0' is 7: the digit codes are consecutive */
        /* Would v * 10 + d pass the limit? Ask before doing the sum, so the
           sum itself can never overflow. */
        if (v > (limit - d) / 10)
            return 0;
        v = v * 10 + d;
        any = 1;
        s++;
    }
    if (!any || *s != '\0')
        return 0;
    if (!negative)
        *out = (int)v;
    else if (v == (unsigned long)INT_MAX + 1)
        *out = INT_MIN;       /* -(int)v would overflow on the way */
    else
        *out = -(int)v;
    return 1;
}

int main(void)
{
    const char *tests[10] = { "42", "   -17", "+8", "007", "12abc", "", "-",
                              "2147483647", "-2147483648", "2147483648" };
    int i, v;
    char *end;
    long l;

    for (i = 0; i < 10; i++) {
        printf("%-14s", tests[i]);
        if (parse_int(tests[i], &v))
            printf("ours %11d", v);
        else
            printf("ours    rejected");
        /* atoi cannot say "that was not a number": "12abc" gives 12 and
           "" gives 0. For a value that does not fit, atoi's result is
           undefined, so it is not even called. strtol reports where it
           stopped through end, and clamps to LONG_MAX when too big. */
        if (i < 9)
            printf("   atoi %11d", atoi(tests[i]));
        else
            printf("   atoi   undefined");
        l = strtol(tests[i], &end, 10);
        printf("   strtol %11ld, stopped at \"%s\"\n", l, end);
    }
    return 0;
}

/*
 * title: Reading numbers safely with strtol and errno
 * level: 3
 * about: Validates lines of input as integers in a range, rejecting empty lines, trailing junk and values that overflow a long.
 * input: 42\n  -17  \n12abc\n\n99999999999\n7.5\n+300\n0x10\n150\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <errno.h>
#include <limits.h>

/*
 * Returns 1 and stores the number in *out when the whole of s is one
 * integer between lo and hi; otherwise returns 0 and sets *why.
 */
static int parse_int(const char *s, long lo, long hi, long *out, const char **why)
{
    char *end;
    long v;

    errno = 0;
    v = strtol(s, &end, 10);

    if (end == s) {
        *why = "no digits";
        return 0;
    }
    /* strtol saturates at LONG_MAX or LONG_MIN and sets ERANGE. */
    if (errno == ERANGE) {
        *why = v == LONG_MAX ? "too big for a long" : "too small for a long";
        return 0;
    }
    /* Allow trailing spaces and the newline, nothing else. */
    while (isspace((unsigned char)*end))
        end++;
    if (*end != '\0') {
        *why = "junk after the number";
        return 0;
    }
    if (v < lo || v > hi) {
        *why = "out of range";
        return 0;
    }
    *out = v;
    return 1;
}

int main(void)
{
    char line[64];
    const char *why = "";
    long v, total = 0;
    int good = 0, n;

    printf("accepting whole numbers from -100 to 200\n");
    while (fgets(line, sizeof line, stdin) != NULL) {
        n = (int)strlen(line);
        if (n > 0 && line[n - 1] == '\n')
            line[--n] = '\0';
        if (parse_int(line, -100L, 200L, &v, &why)) {
            printf("  %-14s ok, %ld\n", line, v);
            total += v;
            good++;
        } else {
            printf("  %-14s rejected: %s\n", line, why);
        }
    }
    printf("%d accepted, total %ld\n", good, total);

    /*
     * "0x10" is rejected because base 10 was asked for: strtol reads
     * the 0 and stops at the x. Passing base 0 would accept it as 16.
     */
    return 0;
}

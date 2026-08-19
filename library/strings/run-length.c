/*
 * title: Run-length encoding
 * level: 2
 * about: Compresses runs of repeated characters into count-letter pairs like 4W3B, decodes them again, and checks the round trip.
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* "WWWWBBBW" -> "4W3B1W". dst must have room for 2 * strlen(src) + 1 in
   the worst case, when no character repeats and every count is a single
   digit. Runs are capped at 9 so each count is one digit. */
static void encode(const char *src, char *dst)
{
    int run;
    while (*src) {
        run = 1;
        while (src[run] == src[0] && run < 9)
            run++;
        *dst++ = (char)('0' + run);
        *dst++ = *src;
        src += run;
    }
    *dst = '\0';
}

static void decode(const char *src, char *dst)
{
    int run;
    while (*src && isdigit((unsigned char)src[0]) && src[1]) {
        run = src[0] - '0';
        while (run-- > 0)
            *dst++ = src[1];
        src += 2;
    }
    *dst = '\0';
}

int main(void)
{
    const char *tests[4] = {
        "WWWWWWWWWWWWBWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWW",
        "aaabccdddd",
        "abc",
        ""
    };
    char packed[160], unpacked[80];
    int i;
    size_t a, b;

    for (i = 0; i < 4; i++) {
        encode(tests[i], packed);
        decode(packed, unpacked);
        a = strlen(tests[i]);
        b = strlen(packed);
        printf("\"%s\"\n  -> \"%s\"\n  %lu -> %lu bytes, round trip %s\n",
               tests[i], packed, (unsigned long)a, (unsigned long)b,
               strcmp(tests[i], unpacked) == 0 ? "ok" : "BROKEN");
    }
    /* "abc" doubles in size: run-length coding only pays off when the
       data really has long runs, like the black-and-white image row. */
    return 0;
}

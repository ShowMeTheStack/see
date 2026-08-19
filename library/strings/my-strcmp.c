/*
 * title: How strcmp decides
 * level: 2
 * about: Writes strcmp by hand and shows why "apple" sorts before "apples", "Zebra" before "apple", and how to compare ignoring case.
 */
#include <stdio.h>
#include <ctype.h>

/* Walk both strings while they agree. The first difference decides; if one
   string ends first, its NUL (0) is smaller than any letter, so the shorter
   one comes first. Comparing as unsigned char matches the library for
   bytes above 127. */
static int my_strcmp(const char *a, const char *b)
{
    while (*a && *a == *b) {
        a++;
        b++;
    }
    return (unsigned char)*a - (unsigned char)*b;
}

/* The same idea with both sides folded to lower case first. */
static int my_stricmp(const char *a, const char *b)
{
    int ca, cb;
    do {
        ca = tolower((unsigned char)*a++);
        cb = tolower((unsigned char)*b++);
    } while (ca && ca == cb);
    return ca - cb;
}

static const char *sign(int v)
{
    return v < 0 ? "<" : v > 0 ? ">" : "==";
}

int main(void)
{
    const char *pairs[6][2] = {
        { "apple", "apricot" },
        { "apple", "apples" },
        { "apple", "apple" },
        { "Zebra", "apple" },
        { "10", "9" },
        { "Hello", "hello" }
    };
    int i, r;

    for (i = 0; i < 6; i++) {
        r = my_strcmp(pairs[i][0], pairs[i][1]);
        printf("%-6s %-2s %-8s (%4d)   ignoring case: %s\n",
               pairs[i][0], sign(r), pairs[i][1], r,
               sign(my_stricmp(pairs[i][0], pairs[i][1])));
    }
    /* "Zebra" < "apple" because 'Z' is 90 and 'a' is 97 in ASCII: capitals
       come before all small letters. "10" < "9" because '1' < '9': strcmp
       compares text, not numbers. */
    return 0;
}

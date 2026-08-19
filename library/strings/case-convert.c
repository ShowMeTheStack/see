/*
 * title: Upper, lower and title case
 * level: 1
 * about: Converts a sentence to capitals, small letters and Title Case with the ctype functions, and shows the ASCII arithmetic behind them.
 */
#include <stdio.h>
#include <ctype.h>
#include <string.h>

static void to_upper(char *s)
{
    for (; *s; s++)
        /* The cast matters: ctype functions take an unsigned char value
           (or EOF). A plain char can be negative here, and a negative
           argument is undefined. */
        *s = (char)toupper((unsigned char)*s);
}

static void to_lower(char *s)
{
    for (; *s; s++)
        *s = (char)tolower((unsigned char)*s);
}

/* Capital after anything that is not a letter, small letter otherwise. */
static void to_title(char *s)
{
    int startOfWord = 1;
    for (; *s; s++) {
        if (isalpha((unsigned char)*s)) {
            *s = (char)(startOfWord ? toupper((unsigned char)*s) : tolower((unsigned char)*s));
            startOfWord = 0;
        } else {
            startOfWord = 1;
        }
    }
}

int main(void)
{
    const char *original = "the WIZARD of oz, 1939 edition";
    char buf[64];

    strcpy(buf, original); to_upper(buf); printf("upper: %s\n", buf);
    strcpy(buf, original); to_lower(buf); printf("lower: %s\n", buf);
    strcpy(buf, original); to_title(buf); printf("title: %s\n", buf);

    /* What toupper does for ASCII letters: capitals are exactly 32 below
       small letters, 'a' is 97 and 'A' is 65. */
    printf("'g' is %d, 'G' is %d, difference %d\n", 'g', 'G', 'g' - 'G');
    printf("'g' - 'a' + 'A' = '%c'\n", 'g' - 'a' + 'A');
    /* toupper leaves anything that is not a small letter alone. */
    printf("toupper('7') = '%c', toupper('!') = '%c'\n", toupper('7'), toupper('!'));
    return 0;
}

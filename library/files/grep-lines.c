/*
 * title: A small grep with line numbers
 * level: 2
 * about: Searches a file for a word given on stdin, ignoring case, and prints every matching line with its number and the column of the match.
 * input: the
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* Case-insensitive strstr: returns where needle starts in hay, or NULL.
   C89 has no strcasestr, so we write the obvious double loop. */
static const char *find_nocase(const char *hay, const char *needle)
{
    const char *h, *n;

    for (; *hay != '\0'; hay++) {
        h = hay;
        n = needle;
        while (*n != '\0' && tolower((unsigned char)*h) == tolower((unsigned char)*n)) {
            h++;
            n++;
        }
        if (*n == '\0')
            return hay;
    }
    return NULL;
}

int main(void)
{
    FILE *fp;
    char word[32];
    char line[128];
    const char *hit;
    int lineno = 0, matches = 0;

    fp = fopen("/tmp/raven.txt", "w");
    if (fp == NULL) {
        perror("/tmp/raven.txt");
        return 1;
    }
    fputs("Once upon a midnight dreary,\n", fp);
    fputs("while I pondered, weak and weary,\n", fp);
    fputs("Over many a quaint and curious volume\n", fp);
    fputs("of forgotten lore -\n", fp);
    fputs("While I nodded, nearly napping,\n", fp);
    fputs("suddenly there came a tapping,\n", fp);
    fputs("As of some one gently rapping,\n", fp);
    fputs("rapping at my chamber door.\n", fp);
    fputs("The end.\n", fp);
    fclose(fp);

    if (scanf("%31s", word) != 1)
        return 0;

    fp = fopen("/tmp/raven.txt", "r");
    if (fp == NULL) {
        perror("/tmp/raven.txt");
        return 1;
    }
    while (fgets(line, sizeof line, fp) != NULL) {
        lineno++;
        hit = find_nocase(line, word);
        if (hit != NULL) {
            /* hit - line: subtracting two pointers into the same array
               gives the distance between them, here the column. */
            printf("%2d:%-2d %s", lineno, (int)(hit - line) + 1, line);
            matches++;
        }
    }
    fclose(fp);
    printf("%d matching lines for \"%s\"\n", matches, word);
    return 0;
}

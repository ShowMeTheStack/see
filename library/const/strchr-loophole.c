/*
 * title: The strchr loophole
 * level: 4
 * about: Shows how strchr takes a const string yet returns a plain char pointer into it, and how to write such search functions without opening the hole.
 */
#include <stdio.h>
#include <string.h>

/*
 * strchr's prototype is   char *strchr(const char *s, int c);
 * It must accept const strings (so you can search a literal), and it must
 * return char * (so you can write into a string that IS yours). C89 has
 * no way to say "return the same constness you were given", so the
 * library quietly drops the const on the way out.
 */

/* A safer search for read-only text: the const stays on the result. */
const char *find_char(const char *s, int c)
{
    for (; *s != '\0'; s++)
        if (*s == (char)c)
            return s;
    return NULL;
}

/* Count how many times c appears, using the const-correct search. */
int count_char(const char *s, int c)
{
    int n = 0;
    const char *p;
    for (p = find_char(s, c); p != NULL; p = find_char(p + 1, c))
        n++;
    return n;
}

int main(void)
{
    const char *motto = "keep calm and carry on";   /* read-only literal */
    char path[] = "/usr/local/bin";                  /* our own array */
    char *hole;
    const char *seen;
    char *slash;

    /*
     * Legitimate use: path is writable, so the char * that strchr returns
     * may be written through. Cut the path at the second slash.
     */
    slash = strchr(path + 1, '/');
    if (slash != NULL)
        *slash = '\0';
    printf("first part: %s\n", path);

    /*
     * The hole: strchr hands back a plain char * into a string literal.
     * The compiler is satisfied, but a write through hole, such as
     *     *hole = 'C';
     * would be a write into read-only memory, and See would stop the
     * program right there. Nothing in the types warned us.
     */
    hole = strchr(motto, 'c');
    printf("strchr found: %s\n", hole);

    /* With find_char the result is const char *; *seen = 'C' would not even compile. */
    seen = find_char(motto, 'c');
    printf("find_char found: %s\n", seen);

    printf("'a' appears %d times in \"%s\"\n", count_char(motto, 'a'), motto);

    /*
     * Rule of thumb: keep the result of strchr, strrchr, strstr, strpbrk
     * and strtol's end pointer in a const char * whenever the string you
     * searched was const.
     */
    return 0;
}

/*
 * title: Searching for a word inside text
 * level: 3
 * about: Writes strstr by hand, then counts every occurrence of a pattern, overlapping or not, and marks where each one starts.
 */
#include <stdio.h>
#include <string.h>

/* Try every starting point in hay. At each one, compare characters until
   the needle runs out (a match) or a character differs (move on). */
static const char *my_strstr(const char *hay, const char *needle)
{
    const char *h, *n;
    if (*needle == '\0')
        return hay;            /* the empty string is found at the start */
    for (; *hay; hay++) {
        h = hay;
        n = needle;
        while (*n && *h == *n) {
            h++;
            n++;
        }
        if (*n == '\0')
            return hay;        /* got to the end of the needle: found */
    }
    return NULL;
}

/* Count matches. After a match, step on by 1 to allow overlaps ("aa" in
   "aaaa" three times) or by the needle length to disallow them (twice). */
static int count(const char *hay, const char *needle, int overlap, char *marks)
{
    const char *p = hay;
    int n = 0;
    size_t len = strlen(needle);

    memset(marks, ' ', strlen(hay));
    marks[strlen(hay)] = '\0';
    while ((p = my_strstr(p, needle)) != NULL) {
        marks[p - hay] = '^';
        n++;
        p += overlap ? 1 : len;
    }
    return n;
}

int main(void)
{
    const char *text = "banana bandana, cabana ananas";
    const char *pats[3] = { "ana", "ban", "nan" };
    char marks[64];
    int i;

    printf("text:  %s\n", text);
    for (i = 0; i < 3; i++) {
        int all = count(text, pats[i], 1, marks);
        printf("%-6s %s  overlapping %d", pats[i], marks, all);
        printf(", separate %d\n", count(text, pats[i], 0, marks));
    }
    printf("first \"band\" at offset %d\n", (int)(my_strstr(text, "band") - text));
    printf("\"bandanas\" %s\n", my_strstr(text, "bandanas") ? "found" : "not found");
    return 0;
}

/*
 * title: strchr and strstr return pointers
 * level: 2
 * about: Picks apart an email address and a key=value line using the pointers that strchr, strrchr and strstr return.
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    char email[] = "ada.lovelace@engine.example.org";
    char setting[] = "volume=11";
    const char *text = "one fish two fish red fish blue fish";
    char *at, *dot, *eq;
    const char *hit;
    int count;

    /*
     * strchr gives the address of the first '@', inside email itself. It
     * is not a copy: from that point on, at is the tail of the same array.
     */
    at = strchr(email, '@');
    if (at != NULL) {
        /* Printing a pointer difference as a width prints just the user part. */
        printf("user:   %.*s\n", (int)(at - email), email);
        printf("domain: %s\n", at + 1);
    }

    /* strrchr searches from the end, so this finds the last dot. */
    dot = strrchr(email, '.');
    if (dot != NULL)
        printf("top level: %s\n", dot + 1);

    /*
     * Cutting a string in two: write '\0' where the '=' was. Now setting
     * reads "volume" and eq + 1 reads "11". Watch the byte change in the
     * stack picture when you step over the assignment.
     */
    eq = strchr(setting, '=');
    if (eq != NULL) {
        *eq = '\0';
        printf("key \"%s\", value \"%s\"\n", setting, eq + 1);
    }

    /* strstr in a loop, restarting just after each match. */
    count = 0;
    for (hit = strstr(text, "fish"); hit != NULL; hit = strstr(hit + 1, "fish")) {
        printf("fish at offset %ld\n", (long)(hit - text));
        count++;
    }
    printf("%d fish\n", count);

    /* Not found means NULL, which must be checked before use. */
    if (strchr(email, '#') == NULL)
        printf("no '#' in the address\n");
    return 0;
}

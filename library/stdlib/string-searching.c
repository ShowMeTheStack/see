/*
 * title: Taking a file path apart with strchr and friends
 * level: 2
 * about: Splits paths into directory, name and extension with strrchr, counts separators with strchr, and checks characters with strspn, strcspn, strpbrk and strstr.
 */
#include <stdio.h>
#include <string.h>

static void split_path(const char *path)
{
    const char *slash, *dot, *p;
    int depth = 0;

    printf("%s\n", path);

    /* strrchr finds the LAST '/', which ends the directory part. */
    slash = strrchr(path, '/');
    if (slash != NULL)
        printf("  directory: %.*s\n", (int)(slash - path), path);
    else
        slash = path - 1;   /* no directory: the name starts at path */

    /* The extension's dot must come after the last slash. */
    dot = strrchr(slash + 1, '.');
    if (dot != NULL && dot != slash + 1) {
        printf("  name:      %.*s\n", (int)(dot - (slash + 1)), slash + 1);
        printf("  extension: %s\n", dot + 1);
    } else {
        printf("  name:      %s (no extension)\n", slash + 1);
    }

    /* strchr in a loop: each search starts just after the last hit. */
    for (p = strchr(path, '/'); p != NULL; p = strchr(p + 1, '/'))
        depth++;
    printf("  slashes:   %d\n", depth);

    /* strstr finds a whole substring. */
    if (strstr(path, "..") != NULL)
        printf("  warning:   path climbs up with ..\n");

    /*
     * strspn counts how many leading characters come from a set;
     * strcspn counts how many leading characters do NOT.
     */
    printf("  leading slashes or dots: %d\n", (int)strspn(path, "/."));
    printf("  chars before first '/':  %d\n", (int)strcspn(path, "/"));

    /* strpbrk finds the first character from a set. */
    p = strpbrk(path, " *?");
    if (p != NULL)
        printf("  unusual character '%c' at position %d\n", *p, (int)(p - path));
}

int main(void)
{
    split_path("/home/ada/notes/engine.txt");
    split_path("archive.tar.gz");
    split_path("../src/main.c");
    split_path("/etc/hosts");
    split_path("photos/my cat?.jpeg");
    split_path(".profile");

    /*
     * Step into split_path in See: slash and dot are arrows into the
     * middle of the string literal. No copies are made; the %.*s format
     * prints just the first n characters starting at a pointer.
     */
    return 0;
}

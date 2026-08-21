/*
 * title: Walking argv with a char **
 * level: 2
 * about: Visits the command-line words with a moving char ** pointer and inspects each word with a char * pointer.
 * args: copy -v notes.txt backup/notes.txt
 */
#include <stdio.h>

/*
 * argv is an array of char pointers, ending with a NULL pointer, so
 * argv[argc] is always NULL. Inside main, argv is really a char **:
 * a pointer to the first of those char pointers.
 */
int main(int argc, char *argv[])
{
    char **ap;
    char *c;
    int flags = 0;

    printf("argc = %d\n", argc);

    /*
     * ap walks the array of pointers; *ap is the current word; **ap is
     * its first character. The loop stops at the NULL at the end, so it
     * does not even need argc.
     */
    for (ap = argv + 1; *ap != NULL; ap++) {
        if (**ap == '-') {
            flags++;
            printf("flag   %s\n", *ap);
            continue;
        }
        printf("word   %s", *ap);
        /* Look for a '/' inside this word with a second, inner pointer. */
        for (c = *ap; *c != '\0'; c++)
            if (*c == '/')
                break;
        if (*c == '/')
            printf("   (folder part is %ld chars)", (long)(c - *ap));
        printf("\n");
    }

    printf("%d flag(s), %d other word(s)\n", flags, argc - 1 - flags);
    printf("argv[argc] is %s\n", argv[argc] == NULL ? "NULL, as promised" : "not NULL?");
    return 0;
}

/*
 * title: find with -x and -n options
 * level: 3
 * about: Prints the input lines that match (or with -x do not match) a pattern, numbering them with -n, parsing options the way chapter 5 does.
 * args: -nx the
 * input: the cat sat\non a mat\nthen it slept\nunder the stars\nwithout a care\n
 */
#include <stdio.h>
#include <string.h>

#define MAXLINE 200

int main(int argc, char *argv[])
{
    char line[MAXLINE];
    long lineno = 0;
    int c, except = 0, number = 0, found = 0;

    /* Options start with '-', and several can be bundled: -nx means
       -n -x. The loop walks argv one argument at a time; the inner
       loop walks the letters of one argument.
       (*++argv)[0] is the first character of the next argument:
       ++argv moves to the next pointer, * follows it to the string,
       [0] takes the first character. The brackets are needed because
       [] binds tighter than *. */
    while (--argc > 0 && (*++argv)[0] == '-')
        while ((c = *++argv[0]) != '\0')
            switch (c) {
            case 'x':
                except = 1;
                break;
            case 'n':
                number = 1;
                break;
            default:
                printf("find: illegal option %c\n", c);
                argc = 0;
                break;
            }

    if (argc != 1) {
        printf("Usage: find -x -n pattern\n");
        return 0;
    }

    /* Now argv points at the pattern. strstr does what strindex did. */
    while (fgets(line, MAXLINE, stdin) != NULL) {
        lineno++;
        if ((strstr(line, *argv) != NULL) != except) {
            if (number)
                printf("%ld:", lineno);
            printf("%s", line);
            found++;
        }
    }
    printf("(%d lines %s \"%s\")\n", found, except ? "without" : "with", *argv);
    return 0;
}

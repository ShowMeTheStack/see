/*
 * title: echo and the argv array
 * level: 1
 * about: Prints its command-line arguments twice, once indexing argv like an array and once walking it with a pointer.
 * args: hello, world from the command line
 */
#include <stdio.h>

int main(int argc, char *argv[])
{
    int i;

    /* argv is an array of pointers to strings; argv[0] is the program's
       name and argv[argc] is a NULL pointer. In the memory picture each
       argv[i] is an arrow to a separate string. */
    for (i = 1; i < argc; i++)
        printf("%s%s", argv[i], (i < argc - 1) ? " " : "");
    printf("\n");

    /* The same with pointers. argv is a char ** here, so ++argv moves it
       to the next pointer, and *argv is the string it points at. --argc
       counts the arguments that are left. */
    while (--argc > 0)
        printf((argc > 1) ? "%s " : "%s", *++argv);
    printf("\n");
    return 0;
}

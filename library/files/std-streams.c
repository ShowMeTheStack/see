/*
 * title: stdin, stdout and stderr are FILE pointers too
 * level: 1
 * about: Writes the same report to stdout and to a file through one function that takes a FILE pointer, reading names from stdin with fgets.
 * input: Mia\nOmar\n\nZoe\n
 */
#include <stdio.h>
#include <string.h>

/* This function has no idea where its output goes. Pass it stdout and it
   prints on the screen; pass it a FILE from fopen and it fills the file.
   That is the point of FILE pointers. */
static void greet(FILE *out, const char *name, int n)
{
    fprintf(out, "%d. Hello, %s!\n", n, name);
}

int main(void)
{
    char name[32];
    char names[5][32];
    int count = 0, i;
    FILE *fp;
    int c;

    /* The three standard streams are opened before main starts. stdin is
       just a FILE *, so fgets works on it exactly as on a file. */
    while (count < 5 && fgets(name, sizeof name, stdin) != NULL) {
        name[strcspn(name, "\n")] = '\0';
        if (name[0] == '\0') {
            /* stderr is for complaints. It is a separate stream, so the
               message would not end up in a redirected output file. */
            fprintf(stderr, "skipping an empty line\n");
            continue;
        }
        strcpy(names[count], name);
        count++;
    }

    for (i = 0; i < count; i++)
        greet(stdout, names[i], i + 1);

    fp = fopen("/tmp/greetings.txt", "w");
    if (fp == NULL) {
        perror("/tmp/greetings.txt");
        return 1;
    }
    for (i = 0; i < count; i++)
        greet(fp, names[i], i + 1);
    fclose(fp);

    /* Copy the file to stdout with plain putc - again just a FILE *. */
    printf("--- the file holds ---\n");
    fp = fopen("/tmp/greetings.txt", "r");
    if (fp == NULL) {
        perror("/tmp/greetings.txt");
        return 1;
    }
    while ((c = getc(fp)) != EOF)
        putc(c, stdout);
    fclose(fp);
    return 0;
}

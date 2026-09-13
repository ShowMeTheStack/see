/*
 * title: Write a file, read it back line by line
 * level: 1
 * about: Writes three lines to /tmp/poem.txt with fprintf, then reads them back with fgets and numbers them.
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    FILE *fp;
    char line[80];
    int n = 0;

    /* "w" creates the file, or empties it if it is already there.
       fopen hands back a FILE pointer: a handle the library uses to
       remember where in the file you are. Watch fp in the variables
       panel: it is NULL until the open succeeds. */
    fp = fopen("/tmp/poem.txt", "w");
    if (fp == NULL) {
        perror("/tmp/poem.txt");
        return 1;
    }
    fprintf(fp, "The rain in Spain\n");
    fprintf(fp, "stays mainly\n");
    fprintf(fp, "in the plain.\n");
    /* fclose flushes what is still buffered and frees the handle.
       Forgetting it can leave the file short of its last few bytes. */
    fclose(fp);

    /* Open the same file again, this time for reading. */
    fp = fopen("/tmp/poem.txt", "r");
    if (fp == NULL) {
        perror("/tmp/poem.txt");
        return 1;
    }

    /* fgets reads up to and including the newline, and never more than
       sizeof line - 1 characters, so it cannot overflow line. It returns
       NULL when there is nothing left: that is the loop's stop signal.
       Step over the fgets (F10) and watch line fill up with one row. */
    while (fgets(line, sizeof line, fp) != NULL) {
        n++;
        /* The newline is still in the buffer; chop it off so the
           brackets below hug the text. */
        line[strcspn(line, "\n")] = '\0';
        printf("%d: [%s] has %d characters\n", n, line, (int)strlen(line));
    }
    fclose(fp);

    printf("%d lines read\n", n);
    return 0;
}

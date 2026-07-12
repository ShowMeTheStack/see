/* notes.c: write a file, then read it back.
   The file goes in /tmp; look for it in the Files panel afterwards. */
#include <stdio.h>

int main(void)
{
    FILE *f;
    char line[80];
    int n = 0;

    f = fopen("/tmp/notes.txt", "w");
    if (f == NULL) {
        perror("/tmp/notes.txt");
        return 1;
    }
    fprintf(f, "buy milk\n");
    fprintf(f, "learn pointers\n");
    fprintf(f, "call home\n");
    fclose(f);

    f = fopen("/tmp/notes.txt", "r");
    if (f == NULL) {
        perror("/tmp/notes.txt");
        return 1;
    }
    while (fgets(line, sizeof line, f) != NULL)
        printf("%d. %s", ++n, line);     /* line keeps its \n */
    fclose(f);
    return 0;
}

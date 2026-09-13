/*
 * title: The while (!feof) bug, explained
 * level: 2
 * about: Shows why looping on feof prints the last line twice and counts one record too many, then fixes it by testing the read itself.
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    FILE *fp;
    char line[32];
    int x, sum, count;

    fp = fopen("/tmp/feof.txt", "w");
    if (fp == NULL) {
        perror("/tmp/feof.txt");
        return 1;
    }
    fputs("apple\nbanana\ncherry\n", fp);
    fclose(fp);

    fp = fopen("/tmp/feof.txt", "r");
    if (fp == NULL) {
        perror("/tmp/feof.txt");
        return 1;
    }

    /* THE BUG. feof does not look ahead. It only reports that an earlier
       read already bumped into the end. After "cherry\n" is read the
       position is at the end, but no read has failed yet, so feof is still
       0 and the loop runs once more. That fgets fails and leaves line
       unchanged - still "cherry" - and it is printed a second time.
       Step through and watch feof's answer on each pass. */
    printf("wrong loop:\n");
    strcpy(line, "");
    while (!feof(fp)) {
        fgets(line, sizeof line, fp);
        printf("  got %s", line);
    }

    /* THE FIX. Every reading function says whether it worked: fgets
       returns NULL, fscanf returns fewer items, fgetc returns EOF, fread
       returns a short count. Make that the loop test. */
    rewind(fp);     /* back to the start, and clears the end-of-file flag */
    printf("right loop:\n");
    while (fgets(line, sizeof line, fp) != NULL)
        printf("  got %s", line);

    /* Once the read fails, feof and ferror tell you WHY: a normal end, or
       a real error. That is what they are for. */
    printf("ended because: %s\n", feof(fp) ? "end of file" : ferror(fp) ? "error" : "?");
    fclose(fp);

    /* Same story with numbers. With the feof loop the final fscanf fails,
       x keeps its old value 30, and it is added twice. */
    fp = fopen("/tmp/feof.txt", "w");
    if (fp == NULL) {
        perror("/tmp/feof.txt");
        return 1;
    }
    fputs("10 20 30\n", fp);
    fclose(fp);

    fp = fopen("/tmp/feof.txt", "r");
    if (fp == NULL) {
        perror("/tmp/feof.txt");
        return 1;
    }
    sum = 0; count = 0; x = 0;
    while (!feof(fp)) {
        fscanf(fp, "%d", &x);
        sum += x;
        count++;
    }
    printf("feof loop:    %d numbers, sum %d\n", count, sum);

    rewind(fp);
    sum = 0; count = 0;
    while (fscanf(fp, "%d", &x) == 1) {
        sum += x;
        count++;
    }
    printf("checked loop: %d numbers, sum %d\n", count, sum);
    fclose(fp);
    return 0;
}

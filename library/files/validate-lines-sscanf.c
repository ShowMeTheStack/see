/*
 * title: Robust input: fgets then sscanf
 * level: 2
 * about: Reads a file of date and temperature lines, accepting good lines and reporting bad ones by line number, using fgets plus sscanf.
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    FILE *fp;
    char line[80];
    char extra;
    int lineno = 0, good = 0, y, m, d;
    double temp, sum = 0.0;

    fp = fopen("/tmp/temps.txt", "w");
    if (fp == NULL) {
        perror("/tmp/temps.txt");
        return 1;
    }
    fputs("2024-03-01 12.5\n", fp);
    fputs("2024-03-02 14.0\n", fp);
    fputs("2024-3-x 9\n", fp);
    fputs("2024-03-04 -2.25\n", fp);
    fputs("2024-03-05 11 degrees\n", fp);
    fputs("2024-13-06 10\n", fp);
    fputs("2024-03-07 15.5\n", fp);
    fclose(fp);

    fp = fopen("/tmp/temps.txt", "r");
    if (fp == NULL) {
        perror("/tmp/temps.txt");
        return 1;
    }

    /* Why not fscanf straight from the file? If one line is bad,
       fscanf stops in the middle of it and every later read is out of
       step. Reading a whole line first, then picking it apart with
       sscanf, keeps each mistake inside its own line.
       The trailing " %c" tries to read one more non-space character: if it
       succeeds (5 items), there was junk after the number. */
    while (fgets(line, sizeof line, fp) != NULL) {
        int got;

        lineno++;
        got = sscanf(line, "%d-%d-%d %lf %c", &y, &m, &d, &temp, &extra);
        if (got != 4) {
            line[strcspn(line, "\n")] = '\0';
            printf("line %d: cannot read \"%s\" (%d fields)\n", lineno, line, got);
            continue;
        }
        if (m < 1 || m > 12 || d < 1 || d > 31) {
            printf("line %d: no such date %d-%d-%d\n", lineno, y, m, d);
            continue;
        }
        printf("line %d: %02d/%02d %6.2f C\n", lineno, d, m, temp);
        sum += temp;
        good++;
    }
    fclose(fp);

    if (good > 0)
        printf("%d good readings, average %.2f C\n", good, sum / good);
    return 0;
}

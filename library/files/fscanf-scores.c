/*
 * title: Reading a score table with fscanf
 * level: 2
 * about: Writes names with three test scores to a file, reads them back with fscanf and prints each average and the best student.
 */
#include <stdio.h>
#include <string.h>

struct student {
    char name[16];
    int score[3];
    double average;
};

int main(void)
{
    FILE *fp;
    struct student s[8];
    int count = 0;
    int i, best = 0;
    int got;

    fp = fopen("/tmp/scores.txt", "w");
    if (fp == NULL) {
        perror("/tmp/scores.txt");
        return 1;
    }
    fprintf(fp, "Asha 78 91 85\n");
    fprintf(fp, "Bruno 66 72 70\n");
    fprintf(fp, "Chen 95 88 99\n");
    fprintf(fp, "Dana 81 79 90\n");
    fclose(fp);

    fp = fopen("/tmp/scores.txt", "r");
    if (fp == NULL) {
        perror("/tmp/scores.txt");
        return 1;
    }

    /* fscanf returns how many items it filled in. Asking for 4 and
       checking for exactly 4 catches both the end of the file (EOF) and a
       malformed line. %15s stops at 15 characters so the name always fits
       in 16 bytes with its terminating zero. Watch s[count] in the
       memory picture: each call fills in one struct of the array. */
    while (count < 8) {
        got = fscanf(fp, "%15s %d %d %d", s[count].name,
                     &s[count].score[0], &s[count].score[1], &s[count].score[2]);
        if (got != 4)
            break;
        s[count].average = (s[count].score[0] + s[count].score[1] + s[count].score[2]) / 3.0;
        count++;
    }
    fclose(fp);

    printf("%-8s %5s %5s %5s %8s\n", "name", "t1", "t2", "t3", "average");
    for (i = 0; i < count; i++) {
        printf("%-8s %5d %5d %5d %8.2f\n", s[i].name,
               s[i].score[0], s[i].score[1], s[i].score[2], s[i].average);
        if (s[i].average > s[best].average)
            best = i;
    }
    if (count > 0)
        printf("best: %s with %.2f\n", s[best].name, s[best].average);
    return 0;
}

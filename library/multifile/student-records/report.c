/* report.c - printing only. It reads the records but never changes them,
 * which the const in every parameter promises. */
#include <stdio.h>
#include "report.h"

static char grade(double avg)
{
    if (avg >= 85) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 55) return 'C';
    if (avg >= 40) return 'D';
    return 'F';
}

void report_table(const char *title, const struct student *list, int n)
{
    int i, k;

    printf("%s\n", title);
    for (i = 0; i < n; i++) {
        printf("  %-8s", list[i].name);
        for (k = 0; k < NMARKS; k++) {
            printf(" %3d", list[i].marks[k]);
        }
        printf("   %6.2f  %c\n", list[i].average, grade(list[i].average));
    }
}

void report_summary(const struct student *list, int n)
{
    int k, i, best;

    for (k = 0; k < NMARKS; k++) {
        best = 0;
        for (i = 1; i < n; i++) {
            if (list[i].marks[k] > list[best].marks[k]) {
                best = i;
            }
        }
        printf("best in paper %d: %s with %d\n", k + 1, list[best].name, list[best].marks[k]);
    }
}

/*
 * title: Student records across three files
 * level: 2
 * about: Reads names and marks, computes averages and grades, and prints the class sorted two ways.
 * input: Zara 78 91 85\nOmar 45 60 52\nIvy 88 79 94\nLeo 30 41 38\nMaya 70 70 71\nBo 91 85 88\n
 */

/* student.c reads and sorts, report.c prints, main.c runs the show. See
 * compiles all three .c files and links them into one program. The array
 * of records lives in main's frame; expand it in the stack panel and watch
 * qsort shuffle whole 32-byte structs around. */
#include <stdio.h>
#include "student.h"
#include "report.h"

int main(void)
{
    struct student list[MAX_STUDENTS];
    int n;

    n = students_read(list, MAX_STUDENTS);
    printf("read %d students\n", n);
    if (n == 0) {
        return 0;
    }
    students_compute(list, n);

    students_sort_by_average(list, n);
    report_table("ranked by average:", list, n);

    students_sort_by_name(list, n);
    report_table("by name:", list, n);

    report_summary(list, n);
    return 0;
}

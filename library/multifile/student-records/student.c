/* student.c - reading, computing and sorting. qsort from <stdlib.h> sorts
 * anything, given the size of one element and a comparison function. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "student.h"

int students_read(struct student *list, int max)
{
    int n = 0;
    int k;
    struct student *s;

    while (n < max) {
        s = &list[n];
        /* Start each record from all zeros, so the unused tail of name[]
         * shows as zeros rather than leftover stack garbage. */
        memset(s, 0, sizeof *s);
        if (scanf("%11s", s->name) != 1) {
            break;
        }
        for (k = 0; k < NMARKS; k++) {
            if (scanf("%d", &s->marks[k]) != 1) {
                return n;
            }
        }
        n++;
    }
    return n;
}

void students_compute(struct student *list, int n)
{
    int i, k, sum;

    for (i = 0; i < n; i++) {
        sum = 0;
        for (k = 0; k < NMARKS; k++) {
            sum += list[i].marks[k];
        }
        list[i].average = (double)sum / NMARKS;    /* cast first, or it is integer division */
    }
}

/* qsort hands us two const void *; we know they really point at students. */
static int by_average(const void *a, const void *b)
{
    const struct student *x = a;
    const struct student *y = b;

    if (x->average < y->average) return 1;      /* highest first */
    if (x->average > y->average) return -1;
    return strcmp(x->name, y->name);
}

static int by_name(const void *a, const void *b)
{
    const struct student *x = a;
    const struct student *y = b;
    return strcmp(x->name, y->name);
}

void students_sort_by_average(struct student *list, int n)
{
    qsort(list, n, sizeof list[0], by_average);
}

void students_sort_by_name(struct student *list, int n)
{
    qsort(list, n, sizeof list[0], by_name);
}

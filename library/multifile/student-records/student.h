/* student.h - one record per student, and the operations on a class list. */
#ifndef STUDENT_H
#define STUDENT_H

#define MAX_STUDENTS 12
#define NMARKS 3

struct student {
    char name[12];
    int marks[NMARKS];
    double average;
};

int students_read(struct student *list, int max);
void students_compute(struct student *list, int n);
void students_sort_by_average(struct student *list, int n);
void students_sort_by_name(struct student *list, int n);

#endif

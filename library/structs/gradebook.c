/*
 * title: Gradebook with an array of structs
 * level: 2
 * about: Reads students and three marks each into an array of structs, prints a report with averages, letter grades and the class top scorer.
 * input: 5\nAmara 78 85 91\nBen 55 62 48\nChen 90 94 99\nDara 67 71 70\nEli 82 79 88\n
 */
#include <stdio.h>

#define MAX_STUDENTS 10
#define MARKS 3

/* Each student is one struct; the class is an array of them. In the memory
   picture the array is a row of identical boxes, each with a name and three
   marks inside. That is the "array of structs" layout. */
struct student {
    char name[16];
    int mark[MARKS];
    double average;
    char grade;
};

char letter(double avg)
{
    if (avg >= 90) return 'A';
    if (avg >= 80) return 'B';
    if (avg >= 70) return 'C';
    if (avg >= 60) return 'D';
    return 'F';
}

/* Fill in the derived fields of one student. The pointer lets the function
   write straight into the array element. */
void grade_student(struct student *s)
{
    int k, total = 0;
    for (k = 0; k < MARKS; k++)
        total += s->mark[k];
    s->average = (double)total / MARKS;
    s->grade = letter(s->average);
}

int main(void)
{
    struct student cls[MAX_STUDENTS];
    int n, i, k, best = 0;
    double class_total = 0.0;

    if (scanf("%d", &n) != 1 || n < 1 || n > MAX_STUDENTS) {
        printf("need between 1 and %d students\n", MAX_STUDENTS);
        return 0;
    }

    for (i = 0; i < n; i++) {
        /* %15s stops at 15 characters so the name always fits with its '\0'. */
        scanf("%15s", cls[i].name);
        for (k = 0; k < MARKS; k++)
            scanf("%d", &cls[i].mark[k]);
        /* &cls[i] is the address of element i: watch the arrow land on it. */
        grade_student(&cls[i]);
    }

    printf("%-8s %5s %5s %5s %7s %s\n", "name", "m1", "m2", "m3", "avg", "grade");
    for (i = 0; i < n; i++) {
        printf("%-8s", cls[i].name);
        for (k = 0; k < MARKS; k++)
            printf(" %5d", cls[i].mark[k]);
        printf(" %7.2f %c\n", cls[i].average, cls[i].grade);
        class_total += cls[i].average;
        if (cls[i].average > cls[best].average)
            best = i;
    }
    printf("class average %.2f\n", class_total / n);
    printf("top of the class: %s with %.2f\n", cls[best].name, cls[best].average);
    return 0;
}

/*
 * title: Marks to letter grades
 * level: 1
 * about: Reads five exam marks and turns each into a letter grade with an if/else-if chain.
 * input: 95 82 71 64 38
 */
#include <stdio.h>

int main(void)
{
    int mark;
    int count;
    char grade;

    for (count = 0; count < 5; count++) {
        scanf("%d", &mark);

        /* The chain is tested from the top. As soon as one condition is true,
           its branch runs and the rest are skipped. That is why the second test
           only needs "mark >= 80": by the time we get there we already know the
           mark is below 90. Order matters: put 50 first and every pass would
           get a D. */
        if (mark >= 90)
            grade = 'A';
        else if (mark >= 80)
            grade = 'B';
        else if (mark >= 70)
            grade = 'C';
        else if (mark >= 50)
            grade = 'D';
        else
            grade = 'F';  /* the final else catches everything left over */

        /* Step with F10 and watch the yellow line jump straight past the
           other branches once one has matched. */
        printf("mark %3d -> grade %c\n", mark, grade);
    }
    return 0;
}

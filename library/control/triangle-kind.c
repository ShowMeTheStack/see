/*
 * title: What kind of triangle?
 * level: 2
 * about: Classifies three side lengths as not a triangle, equilateral, isosceles or scalene, and right-angled or not.
 * input: 3 4 5\n2 2 2\n5 5 8\n1 2 3\n7 10 5\n6 8 10\n5 13 12
 */
#include <stdio.h>

int main(void)
{
    int a, b, c, t;

    while (scanf("%d %d %d", &a, &b, &c) == 3) {
        printf("%2d %2d %2d: ", a, b, c);

        /* Sort the three sides so that c is the longest. Three
           compare-and-swap steps are enough for three values. After this,
           every later test only has to think about one arrangement. */
        if (a > b) { t = a; a = b; b = t; }
        if (b > c) { t = b; b = c; c = t; }
        if (a > b) { t = a; a = b; b = t; }

        /* The triangle inequality: the two short sides together must be
           longer than the long one. 1 2 3 lies flat, so it fails. Test the
           impossible case first and the rest of the chain can assume a
           real triangle. */
        if (a <= 0 || a + b <= c) {
            printf("not a triangle\n");
            continue;
        }
        if (a == c)                 /* sorted, so a == c means all equal */
            printf("equilateral");
        else if (a == b || b == c)
            printf("isosceles");
        else
            printf("scalene");

        /* Pythagoras works in whole numbers, so no rounding worries. */
        if (a * a + b * b == c * c)
            printf(", right-angled");
        printf("\n");
    }
    return 0;
}

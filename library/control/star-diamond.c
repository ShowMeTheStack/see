/*
 * title: Diamond of stars
 * level: 2
 * about: Draws a diamond of any odd height by measuring each line's distance from the middle.
 * input: 9
 */
#include <stdio.h>

int main(void)
{
    int h;      /* height, made odd */
    int mid;    /* index of the widest line */
    int i, j;
    int d;      /* how far line i is from the middle */

    scanf("%d", &h);
    if (h % 2 == 0)
        h++;  /* a diamond needs a single middle line */
    mid = h / 2;

    /* Instead of one loop for the top half and another for the bottom,
       notice that line i only depends on its distance d from the middle:
       it has d spaces and then 2*(mid-d)+1 stars. One loop covers both
       halves. */
    for (i = 0; i < h; i++) {
        d = i < mid ? mid - i : i - mid;
        for (j = 0; j < d; j++)
            putchar(' ');
        for (j = 0; j < 2 * (mid - d) + 1; j++)
            putchar('*');
        putchar('\n');
    }
    return 0;
}

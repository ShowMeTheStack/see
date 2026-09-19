/*
 * title: month_name with an array of pointers
 * level: 1
 * about: Returns month names from a static array of pointers to strings, and compares that with a two-dimensional array of chars.
 */
#include <stdio.h>

/* Return a pointer to the name of the n-th month. The array is static
   inside the function: it is made once, before main starts, not on every
   call, and it is private to month_name. In the memory picture name is
   13 pointers, each an arrow into the string literals. */
const char *month_name(int n)
{
    static const char *name[] = {
        "Illegal month",
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    };
    return (n < 1 || n > 12) ? name[0] : name[n];
}

int main(void)
{
    /* The other way to store a list of names: a 2D array of chars, every
       row as long as the longest name. Short names waste the rest of
       their row. The array of pointers above uses exactly as much room as
       each string needs, plus a pointer each. */
    char grid[3][10];
    int i;

    for (i = 0; i <= 13; i++)
        printf("%2d: %s\n", i, month_name(i));

    sprintf(grid[0], "%s", "Jan");
    sprintf(grid[1], "%s", "February");
    sprintf(grid[2], "%s", "Mar");
    printf("sizeof grid = %d bytes; sizeof(char *) * 3 = %d bytes plus the strings\n",
           (int)sizeof grid, (int)(sizeof(char *) * 3));
    for (i = 0; i < 3; i++)
        printf("grid[%d] = %s, starts %d bytes into grid\n",
               i, grid[i], (int)(grid[i] - grid[0]));
    return 0;
}

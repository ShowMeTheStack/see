/*
 * title: Two ways to keep a list of words
 * level: 2
 * about: Compares a 2D char array with an array of pointers to string literals, in size, layout and what can change.
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    /* Way 1: a grid. Every row is 8 bytes, whether the word needs them or
       not. The letters are copied into the stack, so they can be changed. */
    char grid[4][8] = { "fig", "banana", "kiwi", "plum" };

    /* Way 2: four pointers. The words themselves stay in the read-only
       string-literal area; the array only holds their addresses.
       In See, open the string literals panel and follow the arrows. */
    const char *ptrs[4] = { "fig", "banana", "kiwi", "plum" };

    const char *tmp;
    int i;

    printf("sizeof grid = %lu (4 rows of 8)\n", (unsigned long)sizeof grid);
    printf("sizeof ptrs = %lu (4 pointers of 4)\n", (unsigned long)sizeof ptrs);

    for (i = 0; i < 4; i++)
        printf("grid[%d] at %p \"%s\"   ptrs[%d] -> %p \"%s\"\n",
               i, (void *)grid[i], grid[i], i, (void *)ptrs[i], ptrs[i]);

    /* The grid owns its letters, so editing them is fine. */
    grid[0][0] = 'F';
    strcpy(grid[3], "pear");   /* 4 letters + NUL fits in 8 */

    /* The pointer array cannot edit the letters (they are const), but it
       can be reordered cheaply: swapping two pointers moves 4 bytes each,
       never the words. Sorting by pointer swaps is why this layout is popular. */
    tmp = ptrs[0];
    ptrs[0] = ptrs[1];
    ptrs[1] = tmp;

    printf("\nafter changes:\n");
    for (i = 0; i < 4; i++)
        printf("  %-8s %s\n", grid[i], ptrs[i]);
    return 0;
}

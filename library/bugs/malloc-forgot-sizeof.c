/*
 * title: malloc(n) for n ints
 * level: 2
 * about: Allocates room for ten ints with malloc(10), which gives ten bytes, then fills them.
 * expect: fault
 */

/*
 * THE PUZZLE
 * malloc counts in bytes, not in elements. An int here is four bytes.
 * How many ints fit in the block malloc(n) returns when n is 10?
 *
 * HOW TO HUNT IT WITH SEE
 * Step over the malloc line (F10) and hover the new heap block: 10
 * bytes. Step into the fill loop. squares[0] takes bytes 0 to 3,
 * squares[1] bytes 4 to 7. squares[2] would need bytes 8 to 11, but
 * the block ends after byte 9, so See stops the write and tells you
 * the block's size and where it was allocated.
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int n = 10;
    int *squares = malloc(n);
    int i;

    if (squares == NULL)
        return 1;
    for (i = 0; i < n; i++)
        squares[i] = i * i;
    for (i = 0; i < n; i++)
        printf("%d ", squares[i]);
    printf("\n");
    free(squares);
    return 0;
}

/*
 * THE FIX
 *     int *squares = malloc(n * sizeof *squares);
 * Writing sizeof *squares instead of sizeof(int) means the line stays
 * right even if the type of squares is later changed to long or double.
 */

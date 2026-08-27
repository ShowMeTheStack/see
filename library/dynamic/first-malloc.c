/*
 * title: Your first malloc
 * level: 1
 * about: Asks malloc for room for five ints, fills and prints them, and gives the memory back with free.
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *squares;
    int i;

    /*
     * malloc takes a number of bytes and returns the address of a fresh
     * block on the heap, or NULL if there is no room. Writing
     * 5 * sizeof *squares instead of 20 keeps it right if the type changes.
     * Step over this line and a new block appears in the heap panel, with an
     * arrow from squares to it.
     */
    squares = malloc(5 * sizeof *squares);
    if (squares == NULL) {
        printf("out of memory\n");
        return 0;
    }

    /* The block starts with unknown contents, so fill it before reading. */
    for (i = 0; i < 5; i++)
        squares[i] = (i + 1) * (i + 1);

    for (i = 0; i < 5; i++)
        printf("squares[%d] = %d\n", i, squares[i]);

    /*
     * Unlike a local array, the block does not vanish when the function
     * ends. It stays until free is called. Forgetting the free is a leak,
     * and See lists every leaked block when the program finishes.
     */
    free(squares);

    /* squares still holds the old address but must not be used again. */
    squares = NULL;
    printf("freed, and squares is now NULL\n");
    return 0;
}

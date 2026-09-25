/*
 * title: Freeing a pointer that has moved
 * level: 2
 * about: Skips the leading spaces of a heap string by advancing the pointer, then frees the moved pointer.
 * expect: fault
 */

/*
 * THE PUZZLE
 * free() needs exactly the address that malloc gave you; it uses it to
 * find the block's bookkeeping, which sits just before that address.
 * Follow line through the program. Is it still the address malloc
 * returned when it reaches free?
 *
 * HOW TO HUNT IT WITH SEE
 * Step over the malloc line (F10): the new block appears on the heap
 * and line points at its first byte. Keep stepping through the while
 * loop and watch the arrow slide right, one character per pass, until
 * it rests on the 'h'. When free runs, See stops it and tells you the
 * address points into the middle of a block, and where the block
 * really starts. A real allocator would read garbage as a size and
 * corrupt its free list; the crash would come later and elsewhere.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void)
{
    const char *input = "    hello, world";
    char *line = malloc(strlen(input) + 1);

    if (line == NULL)
        return 1;
    strcpy(line, input);

    while (*line == ' ')
        line++;

    printf("[%s]\n", line);
    free(line);
    return 0;
}

/*
 * THE FIX
 * Keep the pointer you got from malloc, and walk with a second one:
 *
 *     char *start = line;
 *     while (*start == ' ')
 *         start++;
 *     printf("[%s]\n", start);
 *     free(line);
 *
 * A good rule: the variable that receives malloc's result never moves.
 */

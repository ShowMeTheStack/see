/* where.c: the same text in three places.
   Step to the printf and compare the three in the memory picture. */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

char global[] = "global";      /* .data: a global array, filled in before main runs */

int main(void)
{
    char local[] = "on the stack";       /* the literal is copied into main's frame */
    const char *lit = "read-only";       /* points straight at the literal, in .rodata */
    char *heap = malloc(strlen(lit) + 1);   /* + 1 for the NUL at the end */

    strcpy(heap, lit);                   /* a copy on the heap, which we may change */
    local[0] = 'O';                      /* fine: our own array */
    heap[0] = 'R';                       /* fine: our own block */
    /* lit[0] = 'X'; would crash: string literals cannot be changed */

    printf("%s | %s | %s | %s\n", global, local, lit, heap);
    printf("addresses: %p %p %p %p\n", (void *)global, (void *)local, (void *)lit, (void *)heap);
    free(heap);
    return 0;
}

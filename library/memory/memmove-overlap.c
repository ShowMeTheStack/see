/*
 * title: memmove when the regions overlap
 * level: 3
 * about: Inserts and deletes characters inside one array by sliding bytes with memmove, and shows why a naive forward copy smears the data.
 */
#include <stdio.h>
#include <string.h>

/* Copies front to back, like a simple memcpy might. Wrong for overlaps that move right. */
static void naive_copy(char *dst, const char *src, size_t n)
{
    size_t i;
    for (i = 0; i < n; i++)
        dst[i] = src[i];
}

int main(void)
{
    char text[32];
    char broken[32];

    strcpy(text, "abcdefgh");
    strcpy(broken, "abcdefgh");

    /*
     * Make room for "XY" at position 2 by shifting "cdefgh" plus its '\0'
     * (7 bytes) two places to the right. Source and destination overlap.
     * memmove copies as if through a temporary buffer, so it works; in
     * practice it simply copies from the back when moving right.
     */
    memmove(text + 4, text + 2, 7);
    text[2] = 'X';
    text[3] = 'Y';
    printf("memmove insert : %s\n", text);

    /*
     * The naive copy writes 'c' over 'e' before it has read 'e', and so on:
     * the first two characters repeat all the way along. Step through the
     * loop in See and watch the array in the stack panel fill with c d c d.
     */
    naive_copy(broken + 4, broken + 2, 7);
    broken[2] = 'X';
    broken[3] = 'Y';
    /*
     * The smear also wiped out the '\0' before it could be copied, so the
     * text no longer ends where it should. Put a terminator back by hand,
     * or printf would run on into bytes nobody ever wrote.
     */
    broken[11] = '\0';
    printf("naive insert   : %s\n", broken);

    /* Deleting is the opposite slide: close the gap by moving left. */
    memmove(text + 2, text + 4, strlen(text + 4) + 1);
    printf("memmove delete : %s\n", text);

    /*
     * memcpy is only promised to work when the regions do not overlap; for
     * sliding inside one array, always use memmove.
     */
    return 0;
}

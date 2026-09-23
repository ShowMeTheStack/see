/* pool.c - the pool is one static array of bytes, cut into POOL_COUNT
 * blocks. Free blocks are chained into a list, and the link is stored
 * INSIDE each free block itself: a free block's first bytes hold a pointer
 * to the next free block. No extra memory is needed for bookkeeping.
 *
 * The union makes every block correctly aligned for a pointer and for
 * double, whatever the caller stores in it. */
#include <stdio.h>
#include "pool.h"

union block {
    union block *next_free;         /* used while the block is free */
    unsigned char bytes[POOL_BLOCK];/* used while the block is lent out */
    double align;                   /* never used; forces 8-byte alignment */
};

static union block arena[POOL_COUNT];
static union block *free_list;
static int in_use[POOL_COUNT];      /* only for pool_map and catching mistakes */

void pool_init(void)
{
    int i;

    /* Thread the free list through the arena: 0 -> 1 -> ... -> 7 -> NULL. */
    for (i = 0; i < POOL_COUNT - 1; i++) {
        arena[i].next_free = &arena[i + 1];
        in_use[i] = 0;
    }
    arena[POOL_COUNT - 1].next_free = NULL;
    in_use[POOL_COUNT - 1] = 0;
    free_list = &arena[0];
}

/* Pop the first free block. In See, free_list's arrow jumps along the
 * arena each time. */
void *pool_alloc(void)
{
    union block *b = free_list;

    if (b == NULL) {
        return NULL;
    }
    free_list = b->next_free;
    in_use[b - arena] = 1;      /* pointer difference = block number */
    return b;
}

/* Push the block back on the front of the free list. Pointer comparison
 * only works between pointers into the same array, which is the case
 * for anything pool_alloc handed out. */
void pool_free(void *p)
{
    union block *b = p;
    long i;

    if (p == NULL) {
        return;
    }
    i = (long)(b - arena);
    if (b < arena || i >= POOL_COUNT || in_use[i] == 0) {
        printf("pool_free: %p is not a block in use\n", p);
        return;
    }
    in_use[i] = 0;
    b->next_free = free_list;
    free_list = b;
}

int pool_available(void)
{
    int n = 0;
    union block *b;

    for (b = free_list; b != NULL; b = b->next_free) {
        n++;
    }
    return n;
}

void pool_map(void)
{
    int i;
    printf("  pool: ");
    for (i = 0; i < POOL_COUNT; i++) {
        printf("%c", in_use[i] ? '#' : '.');
    }
    printf("  (%d free, next %ld)\n", pool_available(),
           free_list != NULL ? (long)(free_list - arena) : -1L);
}

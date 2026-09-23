/* pool.h - a fixed-size block allocator, the kind games and embedded
 * systems use instead of malloc: every block is the same size, so
 * allocating and freeing are each a couple of pointer moves. */
#ifndef POOL_H
#define POOL_H

#include <stddef.h>

#define POOL_BLOCK 16       /* bytes per block */
#define POOL_COUNT 8        /* blocks in the pool */

void pool_init(void);
void *pool_alloc(void);
void pool_free(void *p);
int pool_available(void);
void pool_map(void);

#endif

/* particle.c - a user of the pool. It never calls malloc. */
#include "pool.h"
#include "particle.h"

/* A compile-time check: if struct particle grew past a pool block, the
 * array size would be negative and the compiler would refuse. */
typedef char particle_fits_block[sizeof(struct particle) <= POOL_BLOCK ? 1 : -1];

struct particle *particle_spawn(float x, float y, float vx, float vy)
{
    struct particle *p = pool_alloc();

    if (p != NULL) {
        p->x = x;
        p->y = y;
        p->vx = vx;
        p->vy = vy;
    }
    return p;
}

void particle_kill(struct particle *p)
{
    pool_free(p);
}

void particle_step(struct particle *p)
{
    p->x += p->vx;
    p->y += p->vy;
    p->vy -= 1.0f;      /* gravity */
}

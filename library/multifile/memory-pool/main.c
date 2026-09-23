/*
 * title: A memory pool with a free list inside the blocks
 * level: 4
 * about: Spawns and kills particles from a fixed pool of 16-byte blocks whose free list is threaded through the unused blocks themselves.
 */

/* pool.c is the allocator, particle.c uses it, main.c runs a little
 * fireworks simulation. See compiles all three and links them together.
 * No heap is used at all: open the globals panel, expand arena, and watch
 * the same bytes hold a next_free pointer one moment and a particle's
 * floats the next. */
#include <stdio.h>
#include "pool.h"
#include "particle.h"

#define SLOTS 10

int main(void)
{
    struct particle *live[SLOTS];
    int i, tick, alive, landed;

    pool_init();
    pool_map();

    for (i = 0; i < SLOTS; i++) {
        live[i] = NULL;
    }
    /* Ask for ten particles; the pool only has eight blocks. */
    for (i = 0; i < SLOTS; i++) {
        live[i] = particle_spawn(0.0f, 0.0f, (float)(i - 4), (float)(3 + i % 4));
        if (live[i] == NULL) {
            printf("spawn %d: pool empty\n", i);
        }
    }
    pool_map();

    for (tick = 1; tick <= 12; tick++) {
        alive = 0;
        landed = 0;
        for (i = 0; i < SLOTS; i++) {
            if (live[i] == NULL) {
                continue;
            }
            particle_step(live[i]);
            /* A particle that falls below the ground goes back to the pool. */
            if (live[i]->y < 0.0f) {
                printf("tick %d: particle %d lands at x=%.0f\n", tick, i, live[i]->x);
                particle_kill(live[i]);
                live[i] = NULL;
                landed++;
            } else {
                alive++;
            }
        }
        if (landed > 0) {
            printf("tick %d: %d still flying\n", tick, alive);
            pool_map();
        }
    }

    /* Freed blocks are reused, newest-freed first. */
    live[8] = particle_spawn(1.0f, 1.0f, 0.0f, 0.0f);
    printf("reused a block for particle 8\n");
    pool_map();

    /* Freeing twice is caught by the pool's own check. */
    particle_kill(live[8]);
    particle_kill(live[8]);
    live[8] = NULL;

    for (i = 0; i < SLOTS; i++) {
        particle_kill(live[i]);
    }
    pool_map();
    return 0;
}

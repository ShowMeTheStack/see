#ifndef PARTICLE_H
#define PARTICLE_H

/* 16 bytes: it fits a pool block exactly (checked in particle.c). */
struct particle {
    float x, y;
    float vx, vy;
};

struct particle *particle_spawn(float x, float y, float vx, float vy);
void particle_kill(struct particle *p);
void particle_step(struct particle *p);

#endif

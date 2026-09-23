#ifndef PLAYER_H
#define PLAYER_H
#include "world.h"

struct player {
    struct room *where;     /* points into world.c's static array */
    int carrying[3];        /* carrying[i] is 1 if the player holds item i */
    int moves;
};

void player_start(struct player *p, struct room *start);
void player_look(const struct player *p);
void player_go(struct player *p, int d);
void player_take(struct player *p, const char *word);
void player_inventory(const struct player *p);
#endif

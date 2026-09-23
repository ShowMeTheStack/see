/* world.c - the map. The rooms are a static array, and the exits are
 * pointers from one element to another, so the map is a little graph.
 * Open the globals panel and follow the arrows from rooms[0]. */
#include <string.h>
#include "world.h"

static struct room rooms[5];
static const char *items[3] = { "lamp", "key", "crown" };
static const char *dirs[NDIRS] = { "north", "east", "south", "west" };

static void join(struct room *a, enum dir d, struct room *b)
{
    a->exit[d] = b;
    b->exit[(d + 2) % NDIRS] = a;   /* the opposite direction leads back */
}

static void make(struct room *r, const char *name, const char *text, int item)
{
    int d;

    r->name = name;
    r->text = text;
    for (d = 0; d < NDIRS; d++) {
        r->exit[d] = NULL;
    }
    r->item = item;
    r->locked = 0;
}

struct room *world_build(void)
{
    make(&rooms[0], "Gatehouse", "Cold stone and a rusty portcullis.", NO_ITEM);
    make(&rooms[1], "Courtyard", "Weeds push up between the flagstones.", 0);
    make(&rooms[2], "Kitchen", "Copper pots hang over a dead fire.", 1);
    make(&rooms[3], "Great Hall", "A long table, set for guests who never came.", NO_ITEM);
    make(&rooms[4], "Treasury", "Shelves, mostly bare.", 2);
    rooms[4].locked = 1;

    join(&rooms[0], NORTH, &rooms[1]);
    join(&rooms[1], EAST, &rooms[2]);
    join(&rooms[1], NORTH, &rooms[3]);
    join(&rooms[3], WEST, &rooms[4]);
    return &rooms[0];
}

const char *item_name(int item)
{
    return items[item];
}

int item_find(const char *word)
{
    int i;
    for (i = 0; i < 3; i++) {
        if (strcmp(items[i], word) == 0) {
            return i;
        }
    }
    return NO_ITEM;
}

int dir_from_word(const char *word)
{
    int d;
    for (d = 0; d < NDIRS; d++) {
        if (word[0] == dirs[d][0]) {    /* "n", "north", "nor" all work */
            return d;
        }
    }
    return -1;
}

const char *dir_name(int d)
{
    return dirs[d];
}

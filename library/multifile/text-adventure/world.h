/* world.h - rooms joined by exits, and the items lying in them. */
#ifndef WORLD_H
#define WORLD_H

enum dir { NORTH, EAST, SOUTH, WEST, NDIRS };

#define NO_ITEM -1

struct room {
    const char *name;
    const char *text;
    struct room *exit[NDIRS];   /* NULL where there is no way through */
    int item;                   /* index into the item table, or NO_ITEM */
    int locked;                 /* a locked room cannot be entered without the key */
};

struct room *world_build(void);
const char *item_name(int item);
int item_find(const char *word);
int dir_from_word(const char *word);
const char *dir_name(int d);

#endif

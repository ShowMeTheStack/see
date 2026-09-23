/* player.c - what the player can do. Moving is just changing one pointer:
 * p->where now points at a different room. */
#include <stdio.h>
#include "player.h"

void player_start(struct player *p, struct room *start)
{
    int i;
    p->where = start;
    for (i = 0; i < 3; i++) {
        p->carrying[i] = 0;
    }
    p->moves = 0;
}

void player_look(const struct player *p)
{
    const struct room *r = p->where;
    int d;

    printf("== %s ==\n%s\n", r->name, r->text);
    if (r->item != NO_ITEM) {
        printf("There is a %s here.\n", item_name(r->item));
    }
    printf("Exits:");
    for (d = 0; d < NDIRS; d++) {
        if (r->exit[d] != NULL) {
            printf(" %s", dir_name(d));
        }
    }
    printf("\n");
}

void player_go(struct player *p, int d)
{
    struct room *next = p->where->exit[d];

    if (next == NULL) {
        printf("You can't go %s.\n", dir_name(d));
        return;
    }
    if (next->locked) {
        if (!p->carrying[1]) {
            printf("The door to the %s is locked.\n", dir_name(d));
            return;
        }
        printf("You unlock the door with the key.\n");
        next->locked = 0;
    }
    p->where = next;
    p->moves++;
    player_look(p);
}

void player_take(struct player *p, const char *word)
{
    int item = item_find(word);

    if (item == NO_ITEM || p->where->item != item) {
        printf("There is no %s here.\n", word);
        return;
    }
    p->carrying[item] = 1;
    p->where->item = NO_ITEM;
    printf("Taken: %s.\n", word);
}

void player_inventory(const struct player *p)
{
    int i, any = 0;

    printf("You carry:");
    for (i = 0; i < 3; i++) {
        if (p->carrying[i]) {
            printf(" %s", item_name(i));
            any = 1;
        }
    }
    printf("%s\n", any ? "" : " nothing");
}

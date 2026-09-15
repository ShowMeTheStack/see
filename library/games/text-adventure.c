/*
 * title: A text adventure in an array of rooms
 * level: 3
 * about: Walks a small castle stored as an array of room structs whose exits are indices into the same array, picking up a key to open the vault.
 * input: look\neast\nnorth\ntake lamp\nwest\nnorth\neast\ntake key\nwest\nsouth\ndance\ninventory\nwest\ntake crown\n
 */
#include <stdio.h>
#include <string.h>

enum { NORTH, EAST, SOUTH, WEST, NDIR };
#define NOWHERE (-1)

struct room {
    const char *name;
    const char *text;
    int exit[NDIR];         /* index of the next room, or NOWHERE */
    const char *item;       /* NULL when the room is empty */
    int locked;             /* the vault needs the key */
};

/* The whole map. Exits are plain ints: "go north from room 0" means
   rooms[rooms[0].exit[NORTH]]. Open the globals panel to see the array of
   structs, each with its four exits and pointers to string literals. */
static struct room rooms[] = {
    { "Gate",    "A rusty portcullis. A path leads north.",   { 1, NOWHERE, NOWHERE, NOWHERE }, NULL, 0 },
    { "Hall",    "A long hall with a door on every side.",  { 2, 3, 0, 5 }, "lamp", 0 },
    { "Tower",   "A narrow stair winds up into the dark.",    { NOWHERE, 4, 1, NOWHERE }, NULL, 0 },
    { "Kitchen", "Cold ovens and a smell of old soup.",       { NOWHERE, NOWHERE, NOWHERE, 1 }, NULL, 0 },
    { "Study",   "Books everywhere, and a desk drawer.",      { NOWHERE, NOWHERE, NOWHERE, 2 }, "key", 0 },
    { "Vault",   "Gold! Piles of it, glinting.",              { NOWHERE, 1, NOWHERE, NOWHERE }, "crown", 1 }
};

static const char *dirname[NDIR] = { "north", "east", "south", "west" };

static const char *bag[4];      /* what the player carries */
static int carried = 0;

static int carrying(const char *what)
{
    int i;

    for (i = 0; i < carried; i++)
        if (strcmp(bag[i], what) == 0)
            return 1;
    return 0;
}

static void describe(int here)
{
    const struct room *r = &rooms[here];   /* a pointer into the array */
    int d;

    printf("== %s ==\n%s\n", r->name, r->text);
    if (r->item != NULL)
        printf("You see a %s.\n", r->item);
    printf("Exits:");
    for (d = 0; d < NDIR; d++)
        if (r->exit[d] != NOWHERE)
            printf(" %s", dirname[d]);
    printf("\n");
}

int main(void)
{
    char line[40];
    int here = 0, d, next, moves = 0;

    describe(here);
    while (fgets(line, sizeof line, stdin) != NULL) {
        line[strcspn(line, "\n")] = '\0';
        printf("\n> %s\n", line);
        moves++;

        for (d = 0; d < NDIR; d++)
            if (strcmp(line, dirname[d]) == 0)
                break;
        if (d < NDIR) {
            next = rooms[here].exit[d];
            if (next == NOWHERE) {
                printf("You cannot go %s.\n", dirname[d]);
            } else if (rooms[next].locked && !carrying("key")) {
                printf("The %s door is locked.\n", rooms[next].name);
            } else {
                here = next;
                describe(here);
            }
        } else if (strcmp(line, "look") == 0) {
            describe(here);
        } else if (strncmp(line, "take ", 5) == 0) {
            if (rooms[here].item != NULL && strcmp(rooms[here].item, line + 5) == 0) {
                /* Move the pointer from the room to the bag: the string
                   itself never moves, only who points at it. */
                bag[carried++] = rooms[here].item;
                rooms[here].item = NULL;
                printf("Taken.\n");
            } else {
                printf("There is no %s here.\n", line + 5);
            }
        } else if (strcmp(line, "inventory") == 0) {
            printf("You carry:");
            for (d = 0; d < carried; d++)
                printf(" %s", bag[d]);
            if (carried == 0)
                printf(" nothing");
            printf("\n");
        } else {
            printf("I do not understand \"%s\".\n", line);
        }

        if (carrying("crown")) {
            printf("\nYou carry the crown out into the light. You win in %d moves!\n", moves);
            return 0;
        }
        if (here == 5 && rooms[5].item != NULL)
            printf("(Perhaps you should take the crown.)\n");
    }
    printf("\nThe castle waits for your return.\n");
    return 0;
}

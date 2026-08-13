/*
 * title: A tiny adventure where every room is a function
 * level: 3
 * about: Plays a short text adventure in which each room is its own function that reads a command, changes the player through a pointer and returns the next room.
 * input: look\nsouth\nnorth\ntake lamp\nsouth\neast\nsouth\nlook\nup\neast\nopen chest\n
 */
#include <stdio.h>
#include <string.h>

enum room { HALL, LIBRARY, CELLAR, TREASURY, QUIT };

struct player {
    int has_lamp;
    int has_key;
    int moves;
};

/* Reads one command line into buf; returns 0 at end of input. */
int get_command(char *buf, int size)
{
    int c, n = 0;

    printf("> ");
    while ((c = getchar()) != EOF && c != '\n')
        if (n < size - 1)
            buf[n++] = (char)c;
    buf[n] = '\0';
    if (c == EOF && n == 0) {
        printf("\n");
        return 0;
    }
    printf("%s\n", buf);
    return 1;
}

/* Each room function handles one command and returns where the player
   is afterwards. All of them share one struct player through p: the
   only data that has to outlive a room. */
enum room hall(struct player *p, const char *cmd)
{
    if (strcmp(cmd, "look") == 0)
        printf("A dusty hall. Doors lead north and east; stairs go down to the south.\n");
    else if (strcmp(cmd, "north") == 0)
        return LIBRARY;
    else if (strcmp(cmd, "east") == 0) {
        if (p->has_key)
            return TREASURY;
        printf("The east door is locked.\n");
    } else if (strcmp(cmd, "south") == 0) {
        if (p->has_lamp)
            return CELLAR;
        printf("The stairs vanish into pitch darkness. You need a light.\n");
    } else
        printf("Nothing happens.\n");
    return HALL;
}

enum room library(struct player *p, const char *cmd)
{
    if (strcmp(cmd, "take lamp") == 0 && !p->has_lamp) {
        p->has_lamp = 1;
        printf("You take the brass lamp.\n");
    } else if (strcmp(cmd, "east") == 0)
        printf("Only shelves that way.\n");
    else if (strcmp(cmd, "south") == 0 || strcmp(cmd, "west") == 0)
        return HALL;
    else
        printf("Books, books, and a lamp on the desk.\n");
    return LIBRARY;
}

enum room cellar(struct player *p, const char *cmd)
{
    if (strcmp(cmd, "look") == 0) {
        if (!p->has_key) {
            p->has_key = 1;
            printf("By lamplight you spot a key on a barrel and take it.\n");
        } else
            printf("Barrels and cobwebs.\n");
    } else if (strcmp(cmd, "up") == 0 || strcmp(cmd, "north") == 0)
        return HALL;
    else
        printf("Cold and damp down here.\n");
    return CELLAR;
}

enum room treasury(struct player *p, const char *cmd)
{
    if (strcmp(cmd, "open chest") == 0) {
        printf("Gold! You win in %d moves.\n", p->moves);
        return QUIT;
    }
    printf("A heavy chest sits here.\n");
    return TREASURY;
}

static const char *room_name[] = { "hall", "library", "cellar", "treasury", "" };

int main(void)
{
    struct player me;
    enum room where = HALL, next;
    char cmd[40];

    me.has_lamp = 0;
    me.has_key = 0;
    me.moves = 0;

    while (where != QUIT && get_command(cmd, (int)sizeof cmd)) {
        me.moves++;
        /* The dispatcher: one call per command. In See, step into it
           and the call stack shows main -> the current room. */
        switch (where) {
        case HALL:     next = hall(&me, cmd);     break;
        case LIBRARY:  next = library(&me, cmd);  break;
        case CELLAR:   next = cellar(&me, cmd);   break;
        case TREASURY: next = treasury(&me, cmd); break;
        default:       next = QUIT;               break;
        }
        if (next != where && next != QUIT)
            printf("[you are in the %s]\n", room_name[next]);
        where = next;
    }
    return 0;
}

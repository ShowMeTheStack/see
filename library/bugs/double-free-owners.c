/*
 * title: Two owners, two frees
 * level: 2
 * about: Two player records share one heap-allocated team name and both try to free it.
 * expect: fault
 */

/*
 * THE PUZZLE
 * make_team() allocates one copy of the team name. Both players get
 * a pointer to that same copy. At the end each player is "cleaned up"
 * by freeing its team pointer. How many blocks were allocated? How
 * many times is free called?
 *
 * HOW TO HUNT IT WITH SEE
 * Step over the line that fills b.team (F10) and look at the memory
 * picture: two arrows, from a.team and b.team, meet at the same heap
 * block. That is the moment the bug becomes certain. Run on and See
 * stops at the second free with "double free". Press F8 once to see
 * the block already marked as freed.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct player {
    const char *name;
    char *team;
    int score;
};

static char *make_team(const char *name)
{
    char *t = malloc(strlen(name) + 1);

    if (t != NULL)
        strcpy(t, name);
    return t;
}

static void release(struct player *p)
{
    free(p->team);
    p->team = NULL;
}

int main(void)
{
    struct player a, b;
    char *team = make_team("Rovers");

    a.name = "Mo";
    a.team = team;
    a.score = 12;
    b.name = "Li";
    b.team = team;
    b.score = 9;

    printf("%s plays for %s and scored %d\n", a.name, a.team, a.score);
    printf("%s plays for %s and scored %d\n", b.name, b.team, b.score);

    release(&a);
    release(&b);
    return 0;
}

/*
 * THE FIX
 * Decide who owns the block. Either free team once in main and treat
 * the players' pointers as borrowed, or give each player its own copy
 * with make_team(). Setting p->team to NULL inside release() looks
 * safe, but it only clears that one player's pointer; the other still
 * holds the old address. One allocation, one free.
 */

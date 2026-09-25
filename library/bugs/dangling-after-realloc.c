/*
 * title: A pointer into a growing array
 * level: 4
 * about: Keeps a pointer to the leading team in a dynamic array, then adds more teams so the array is moved by realloc.
 * expect: fault
 */

/*
 * THE PUZZLE
 * The league table is a dynamic array that doubles its capacity when it
 * fills up. main finds the leader and keeps a pointer to that element,
 * so it can print the leader's name later. Between finding and printing,
 * more teams join. Does the leader's struct still live at the same
 * address afterwards?
 *
 * HOW TO HUNT IT WITH SEE
 * Debug with F5 and step until leader is set: its arrow points at an
 * element inside the heap block that holds the table. Now step over the
 * add_team calls (F10) and watch the heap. When the third team is added
 * the block is full. realloc cannot grow it where it stands, because
 * the title block now sits right after it, so it allocates a bigger
 * block, copies the teams across and frees the old one. league.teams now points at the
 * new block. leader still points into the old, freed one. See stops
 * the first time leader is followed: use after free.
 * A real allocator can sometimes grow a block where it stands, and then
 * the pointer happens to stay valid. So the bug comes and goes with the
 * memory layout, which is the worst kind. Try moving the malloc of the
 * title to the end of the add_team calls: See's realloc then grows the
 * block in place, the output looks perfect, and the bug is still there.
 * This is the same trap as "iterator invalidation" in other languages:
 * any pointer into a block is only good until the block moves.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct team {
    char name[12];
    int points;
};

struct table {
    char *title;
    struct team *teams;
    int count;
    int cap;
};

static void add_team(struct table *t, const char *name, int points)
{
    if (t->count == t->cap) {
        int newcap = t->cap == 0 ? 2 : t->cap * 2;
        struct team *bigger = realloc(t->teams, newcap * sizeof *bigger);

        if (bigger == NULL) {
            printf("out of memory\n");
            exit(1);
        }
        t->teams = bigger;
        t->cap = newcap;
    }
    strncpy(t->teams[t->count].name, name, sizeof t->teams[0].name - 1);
    t->teams[t->count].name[sizeof t->teams[0].name - 1] = '\0';
    t->teams[t->count].points = points;
    t->count++;
}

static struct team *top(struct table *t)
{
    struct team *best = NULL;
    int i;

    for (i = 0; i < t->count; i++)
        if (best == NULL || t->teams[i].points > best->points)
            best = &t->teams[i];
    return best;
}

int main(void)
{
    struct table league;
    struct team *leader;
    int i;

    league.teams = NULL;
    league.count = 0;
    league.cap = 0;

    add_team(&league, "Harriers", 31);
    league.title = malloc(strlen("Sunday League") + 1);
    if (league.title == NULL)
        return 1;
    strcpy(league.title, "Sunday League");
    add_team(&league, "Wanderers", 34);
    leader = top(&league);

    add_team(&league, "Athletic", 29);
    add_team(&league, "Rangers", 30);

    printf("%s\n", league.title);
    for (i = 0; i < league.count; i++)
        printf("%-10s %d\n", league.teams[i].name, league.teams[i].points);
    printf("leader: %s\n", leader->name);

    free(league.teams);
    free(league.title);
    return 0;
}

/*
 * THE FIX
 * Remember the leader by index, which survives a move, instead of by
 * address:
 *
 *     int leader = top_index(&league);
 *     ...
 *     printf("leader: %s\n", league.teams[leader].name);
 *
 * or look the leader up again after the last add_team. Whenever code
 * can call realloc on a block, treat every pointer into that block as
 * stale afterwards.
 */

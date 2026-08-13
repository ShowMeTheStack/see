/*
 * title: Sharing data through globals or through parameters
 * level: 2
 * about: Keeps score in a quiz twice, once with global variables any function may change and once with a struct passed by pointer, and shows why the second scales.
 */
#include <stdio.h>

/* ---- Version 1: globals ----
   Every function can see and change these. Short to write, but reading
   award_global alone you cannot tell what it touches, and there can be
   only one score in the whole program. */
int g_points = 0;
int g_streak = 0;

void award_global(int correct)
{
    if (correct) {
        g_streak++;
        g_points += 10 * g_streak;   /* streaks earn more */
    } else
        g_streak = 0;
}

/* ---- Version 2: state passed in ----
   The same rules, but the data travels in through a parameter. The
   prototype now says exactly what the function works on, and each
   player can have a separate score. */
struct score {
    const char *name;
    int points;
    int streak;
};

void award(struct score *s, int correct)
{
    if (correct) {
        s->streak++;
        s->points += 10 * s->streak;
    } else
        s->streak = 0;
}

void report(const struct score *s)
{
    printf("  %-5s %3d points (streak %d)\n", s->name, s->points, s->streak);
}

int main(void)
{
    /* 1 = right answer, 0 = wrong, for two players over six questions */
    int ana[6], raj[6];
    struct score a, r;
    int q;

    ana[0] = 1; ana[1] = 1; ana[2] = 1; ana[3] = 0; ana[4] = 1; ana[5] = 1;
    raj[0] = 0; raj[1] = 1; raj[2] = 1; raj[3] = 1; raj[4] = 1; raj[5] = 0;

    for (q = 0; q < 6; q++)
        award_global(ana[q]);
    printf("with globals, one player: %d points\n", g_points);

    /* Two players with globals would need g_points2, g_streak2 and a
       second copy of award_global. With parameters, two structs do it.
       In See, award's s is an arrow to a in one call and to r in the
       next: the same code working on different data. */
    a.name = "Ana"; a.points = 0; a.streak = 0;
    r.name = "Raj"; r.points = 0; r.streak = 0;
    for (q = 0; q < 6; q++) {
        award(&a, ana[q]);
        award(&r, raj[q]);
    }
    printf("with parameters, two players:\n");
    report(&a);
    report(&r);
    return 0;
}

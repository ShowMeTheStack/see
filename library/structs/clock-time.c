/*
 * title: Adding times on a 24-hour clock
 * level: 1
 * about: Keeps hours, minutes and seconds in a struct, adds durations to it and normalises the result so the clock rolls over correctly.
 */
#include <stdio.h>

struct clock {
    int h, m, s;
};

/* Normalising is the heart of it: push overflow from seconds into minutes,
   from minutes into hours, and wrap the hours round the day. */
void normalise(struct clock *t)
{
    t->m += t->s / 60;
    t->s %= 60;
    t->h += t->m / 60;
    t->m %= 60;
    t->h %= 24;
}

void add_seconds(struct clock *t, int seconds)
{
    t->s += seconds;
    normalise(t);
}

void show(const char *what, struct clock t)
{
    printf("%-26s %02d:%02d:%02d\n", what, t.h, t.m, t.s);
}

int main(void)
{
    struct clock t = { 9, 45, 30 };

    show("start", t);
    add_seconds(&t, 45);
    show("+45 seconds", t);
    add_seconds(&t, 20 * 60);
    show("+20 minutes", t);
    add_seconds(&t, 3 * 3600 + 15 * 60);
    show("+3 hours 15 minutes", t);
    add_seconds(&t, 12 * 3600);
    show("+12 hours (past midnight)", t);

    /* Durations are clock structs too, so the same function can count up a
       running total of lap times. */
    {
        struct clock laps[4] = { { 0, 1, 52 }, { 0, 2, 5 }, { 0, 1, 48 }, { 0, 1, 59 } };
        struct clock total = { 0, 0, 0 };
        int i;
        for (i = 0; i < 4; i++) {
            add_seconds(&total, laps[i].h * 3600 + laps[i].m * 60 + laps[i].s);
            printf("lap %d", i + 1);
            show("", total);
        }
    }
    return 0;
}

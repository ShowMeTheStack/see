/*
 * title: Callbacks across files with an event bus
 * level: 3
 * about: Raises game events from main and lets two other files react through registered function pointers.
 * input: 10 25 5 60 15 40 0
 */

/* Four .c files: events.c (the bus), hud.c and stats.c (listeners) and
 * main.c (the game). See compiles each file and links them. Notice that
 * main.c never calls hud.c or stats.c directly after installing them:
 * all the traffic goes through function pointers in events.c's table. */
#include <stdio.h>
#include "events.h"
#include "hud.h"
#include "stats.h"

int main(void)
{
    struct stats st;
    int points, total = 0, level = 1;

    hud_install();
    stats_install(&st);

    /* Each number is points scored; 0 ends the game. Every 50 total
     * points is a new level. */
    while (scanf("%d", &points) == 1 && points > 0) {
        total += points;
        events_raise(EV_SCORE, points);
        while (total >= level * 50) {
            level++;
            events_raise(EV_LEVEL_UP, level);
        }
    }
    events_raise(EV_GAME_OVER, total);
    stats_print(&st);
    return 0;
}

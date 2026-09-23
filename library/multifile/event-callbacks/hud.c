/* hud.c - the on-screen display. Its handler is static: nobody outside
 * this file can call it by name, yet events.c calls it through the pointer
 * it was given. */
#include <stdio.h>
#include "events.h"
#include "hud.h"

static int shown_score = 0;

static void on_any(enum event_type ev, int value, void *context)
{
    const char *who = context;

    if (ev == EV_SCORE) {
        shown_score += value;
        printf("[%s] score %d (+%d)\n", who, shown_score, value);
    } else {
        printf("[%s] *** %s %d ***\n", who, event_name(ev), value);
    }
}

void hud_install(void)
{
    events_subscribe(EV_SCORE, on_any, "hud");
    events_subscribe(EV_LEVEL_UP, on_any, "hud");
    events_subscribe(EV_GAME_OVER, on_any, "hud");
}

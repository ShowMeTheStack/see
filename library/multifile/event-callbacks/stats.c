/* stats.c - a second listener. Its context pointer is a struct stats that
 * lives in main's frame: the void * carries it through events.c, which
 * never looks inside, and back here where it is turned into the real type. */
#include <stdio.h>
#include "events.h"
#include "stats.h"

static void on_score(enum event_type ev, int value, void *context)
{
    struct stats *s = context;

    (void)ev;   /* the same handler type for every event; this one ignores ev */
    s->events_seen++;
    if (value > s->best_gain) {
        s->best_gain = value;
    }
}

static void on_level(enum event_type ev, int value, void *context)
{
    struct stats *s = context;

    (void)ev;
    s->events_seen++;
    s->levels = value;
}

void stats_install(struct stats *s)
{
    s->events_seen = 0;
    s->best_gain = 0;
    s->levels = 1;
    events_subscribe(EV_SCORE, on_score, s);
    events_subscribe(EV_LEVEL_UP, on_level, s);
}

void stats_print(const struct stats *s)
{
    printf("stats: %d events, best single gain %d, reached level %d\n",
           s->events_seen, s->best_gain, s->levels);
}

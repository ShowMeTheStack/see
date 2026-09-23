/* events.c - a table of function pointers per event. Raising an event is
 * a loop of indirect calls. In See, step into events_raise and then into
 * one of the calls with F11: the editor jumps to whichever file the
 * handler lives in. */
#include "events.h"

#define MAX_HANDLERS 4

struct subscription {
    handler_fn fn;
    void *context;
};

static struct subscription subs[EV_COUNT][MAX_HANDLERS];
static int nsubs[EV_COUNT];

int events_subscribe(enum event_type ev, handler_fn fn, void *context)
{
    if (nsubs[ev] == MAX_HANDLERS) {
        return 0;
    }
    subs[ev][nsubs[ev]].fn = fn;
    subs[ev][nsubs[ev]].context = context;
    nsubs[ev]++;
    return 1;
}

void events_raise(enum event_type ev, int value)
{
    int i;
    for (i = 0; i < nsubs[ev]; i++) {
        subs[ev][i].fn(ev, value, subs[ev][i].context);
    }
}

const char *event_name(enum event_type ev)
{
    static const char *names[EV_COUNT] = { "score", "level-up", "game-over" };
    return names[ev];
}

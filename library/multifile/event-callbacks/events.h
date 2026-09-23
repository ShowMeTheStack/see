/* events.h - a tiny publish/subscribe system. Modules register functions
 * to be called when an event happens; whoever raises the event does not
 * need to know who is listening. */
#ifndef EVENTS_H
#define EVENTS_H

enum event_type { EV_SCORE, EV_LEVEL_UP, EV_GAME_OVER, EV_COUNT };

/* A handler gets the event, a number that goes with it, and the context
 * pointer it was registered with (its own private data). */
typedef void (*handler_fn)(enum event_type ev, int value, void *context);

int events_subscribe(enum event_type ev, handler_fn fn, void *context);
void events_raise(enum event_type ev, int value);
const char *event_name(enum event_type ev);

#endif

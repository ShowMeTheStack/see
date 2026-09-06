/*
 * title: Registering event handlers
 * level: 3
 * about: Keeps a linked list of handler functions per event type on the heap, lets handlers subscribe and unsubscribe, and fires events at them.
 */
#include <stdio.h>
#include <stdlib.h>

enum event { KEY, CLICK, TICK, NEVENTS };
const char *event_name[NEVENTS] = { "key", "click", "tick" };

typedef void (*handler)(enum event e, int data);

/* One subscription: a node holding the handler to call. */
struct sub {
    handler fn;
    struct sub *next;
};

struct sub *subs[NEVENTS];  /* one list per event type, in the globals */

void subscribe(enum event e, handler fn)
{
    struct sub *s = malloc(sizeof *s);
    struct sub **p;
    if (s == NULL)
        return;
    s->fn = fn;
    s->next = NULL;
    /* Append at the end so handlers run in the order they subscribed. */
    for (p = &subs[e]; *p != NULL; p = &(*p)->next)
        ;
    *p = s;
}

/*
 * Remove the first subscription with this function. Comparing function
 * pointers with == is exactly how we recognise "this handler".
 */
void unsubscribe(enum event e, handler fn)
{
    struct sub **p, *dead;
    for (p = &subs[e]; *p != NULL; p = &(*p)->next)
        if ((*p)->fn == fn) {
            dead = *p;
            *p = dead->next;
            free(dead);
            return;
        }
}

void fire(enum event e, int data)
{
    struct sub *s;
    int n = 0;
    printf("%s(%d):\n", event_name[e], data);
    for (s = subs[e]; s != NULL; s = s->next) {
        s->fn(e, data);
        n++;
    }
    if (n == 0)
        printf("  nobody is listening\n");
}

/* Some handlers. Their parameters match the handler type exactly. */
static int keys_typed = 0;
void logger(enum event e, int data)  { printf("  log: %s event, data %d\n", event_name[e], data); }
void echo_key(enum event e, int data) { if (e == KEY) printf("  echo: '%c'\n", data); keys_typed++; }
void count_click(enum event e, int data)
{
    static int clicks = 0;      /* survives between calls, lives with the globals */
    clicks++;
    printf("  click number %d at x=%d\n", clicks, data);
}
void clock_tick(enum event e, int data) { printf("  clock: tick number %d\n", data); }

int main(void)
{
    int e;
    struct sub *s, *next;

    subscribe(KEY, logger);
    subscribe(KEY, echo_key);
    subscribe(CLICK, count_click);
    subscribe(CLICK, logger);
    subscribe(TICK, clock_tick);

    /* Pause here in See: three lists of small heap nodes hang off subs[]. */
    fire(KEY, 'h');
    fire(CLICK, 120);
    fire(TICK, 1);

    printf("-- logger leaves key events, the clock leaves tick events --\n");
    unsubscribe(KEY, logger);
    unsubscribe(TICK, clock_tick);
    fire(KEY, 'i');
    fire(CLICK, 45);
    fire(TICK, 2);
    printf("%d keys typed\n", keys_typed);

    for (e = 0; e < NEVENTS; e++)
        for (s = subs[e]; s != NULL; s = next) {
            next = s->next;
            free(s);
        }
    return 0;
}

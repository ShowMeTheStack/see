/*
 * title: Traffic light where each state returns the next
 * level: 4
 * about: Runs a pedestrian crossing as a state machine in which every state is a function that returns the next state, wrapped in a struct to get around C's type rules.
 * input: ....b...b......b.....
 */
#include <stdio.h>

/*
 * A state function would like to return "a pointer to a function like
 * me", but C cannot write that type: it would have to contain itself.
 * The classic trick is to wrap the pointer in a struct, which may refer
 * to itself through a declared but incomplete type.
 */
struct state;
typedef struct state (*state_fn)(int event);
struct state {
    state_fn next;
    const char *name;
};

static int timer = 0;          /* ticks spent in the current state */
static int waiting = 0;        /* someone pressed the button */

struct state green(int event);
struct state amber(int event);
struct state red_walk(int event);
struct state red_wait(int event);

/* A helper that builds the struct and restarts the timer when the state changes. */
struct state go(state_fn f, const char *name, int changed)
{
    struct state s;
    s.next = f;
    s.name = name;
    if (changed)
        timer = 0;
    return s;
}

/* Events: '.' is one clock tick, 'b' is the walk button being pressed. */
struct state green(int event)
{
    if (event == 'b')
        waiting = 1;
    /* Stay green at least 3 ticks; change only if someone wants to cross. */
    if (event == '.' && ++timer >= 3 && waiting)
        return go(amber, "amber", 1);
    return go(green, "green", 0);
}

struct state amber(int event)
{
    if (event == '.' && ++timer >= 2)
        return go(red_walk, "red, WALK", 1);
    return go(amber, "amber", 0);
}

struct state red_walk(int event)
{
    waiting = 0;
    if (event == '.' && ++timer >= 4)
        return go(red_wait, "red, don't walk", 1);
    return go(red_walk, "red, WALK", 0);
}

struct state red_wait(int event)
{
    if (event == 'b')
        waiting = 1;
    if (event == '.' && ++timer >= 2)
        return go(green, "green", 1);
    return go(red_wait, "red, don't walk", 0);
}

int main(void)
{
    struct state s;
    state_fn before;
    int c, tick = 0;

    s = go(green, "green", 1);
    printf("tick  0: %s\n", s.name);

    /* The whole engine: feed each event to the current state. */
    while ((c = getchar()) != EOF && c != '\n') {
        if (c == '.')
            tick++;
        before = s.next;
        s = s.next(c);
        if (c == 'b')
            printf("         (button pressed)\n");
        /* Comparing function pointers tells us whether the state changed. */
        if (s.next != before)
            printf("tick %2d: %s\n", tick, s.name);
    }
    printf("finished in state: %s\n", s.name);
    return 0;
}

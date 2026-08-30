/*
 * title: A traffic light state machine with enum
 * level: 1
 * about: Steps a traffic light through its states using an enum, with a pedestrian button that shortens the green phase.
 */
#include <stdio.h>

/* An enum gives names to small integer constants. RED is 0, RED_AMBER is 1
   and so on. The names make the code read like the problem. */
enum light { RED, RED_AMBER, GREEN, AMBER };

const char *name_of(enum light s)
{
    switch (s) {
    case RED:       return "RED";
    case RED_AMBER: return "RED+AMBER";
    case GREEN:     return "GREEN";
    case AMBER:     return "AMBER";
    }
    return "?";
}

/* Each state knows what comes next. A switch on an enum is the classic way
   to write a state machine in C. */
enum light next(enum light s)
{
    switch (s) {
    case RED:       return RED_AMBER;
    case RED_AMBER: return GREEN;
    case GREEN:     return AMBER;
    case AMBER:     return RED;
    }
    return RED;
}

int duration(enum light s)
{
    switch (s) {
    case RED:       return 5;
    case RED_AMBER: return 1;
    case GREEN:     return 6;
    case AMBER:     return 2;
    }
    return 1;
}

int main(void)
{
    enum light state = RED;
    int left = duration(state);
    int t;

    for (t = 0; t < 30; t++) {
        /* At t = 18 somebody presses the crossing button. If the light is
           green it cuts the remaining green time to one tick. */
        if (t == 18 && state == GREEN && left > 1) {
            printf("t=%2d  button pressed, green cut short\n", t);
            left = 1;
        }
        printf("t=%2d  %-10s (state %d, %d left)\n", t, name_of(state), (int)state, left);
        left--;
        if (left == 0) {
            state = next(state);
            left = duration(state);
        }
    }
    return 0;
}

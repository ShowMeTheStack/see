/* vending.c - the whole behaviour is one switch on the current state.
 * Each case lists what that state does with each event. A table of
 * function pointers is another way; a switch is easier to step through. */
#include <stdio.h>
#include "vending.h"

const char *state_name(enum state s)
{
    static const char *names[4] = { "IDLE", "COLLECTING", "VENDING", "SOLD_OUT" };
    return names[s];
}

void machine_init(struct machine *m, int stock, int price)
{
    m->state = stock > 0 ? IDLE : SOLD_OUT;
    m->credit = 0;
    m->stock = stock;
    m->price = price;
    m->takings = 0;
}

static void refund(struct machine *m)
{
    if (m->credit > 0) {
        printf("    returns %d cents\n", m->credit);
        m->credit = 0;
    }
}

void machine_handle(struct machine *m, enum event ev, int amount)
{
    switch (m->state) {
    case IDLE:
    case COLLECTING:
        if (ev == EV_COIN) {
            m->credit += amount;
            m->state = COLLECTING;
            printf("    credit %d of %d\n", m->credit, m->price);
        } else if (ev == EV_SELECT) {
            if (m->credit >= m->price) {
                m->credit -= m->price;
                m->takings += m->price;
                m->stock--;
                m->state = VENDING;
                printf("    vending... (%d left)\n", m->stock);
            } else {
                printf("    need %d more\n", m->price - m->credit);
            }
        } else if (ev == EV_REFUND) {
            refund(m);
            m->state = IDLE;
        }
        break;
    case VENDING:
        /* While the drink drops, only "done" is accepted. */
        if (ev == EV_DONE) {
            printf("    drink delivered\n");
            refund(m);          /* give change */
            m->state = m->stock > 0 ? IDLE : SOLD_OUT;
        } else if (ev == EV_COIN) {
            printf("    busy, coin returned\n");
        } else {
            printf("    busy, try again\n");
        }
        break;
    case SOLD_OUT:
        if (ev == EV_COIN) {
            printf("    sold out, coin returned\n");
        } else {
            printf("    sold out\n");
        }
        break;
    }
}

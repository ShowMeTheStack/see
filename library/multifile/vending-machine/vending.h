/* vending.h - a vending machine as a finite state machine.
 * The machine is always in exactly one state; each event (a coin, a
 * button, a refund) moves it to a next state and may print something. */
#ifndef VENDING_H
#define VENDING_H

enum state { IDLE, COLLECTING, VENDING, SOLD_OUT };
enum event { EV_COIN, EV_SELECT, EV_REFUND, EV_DONE };

struct machine {
    enum state state;
    int credit;         /* cents inserted so far */
    int stock;
    int price;
    int takings;
};

void machine_init(struct machine *m, int stock, int price);
void machine_handle(struct machine *m, enum event ev, int amount);
const char *state_name(enum state s);

#endif

/*
 * title: A vending machine state machine
 * level: 2
 * about: Drives a vending machine with coin, select and refund events read from input, printing each state change.
 * input: c 50 s c 50 c 20 s d c 100 s c 10 d r c 25 s d c 50\n
 */

/* See compiles main.c and vending.c separately and links them. main.c only
 * turns input words into events; it never decides what the machine does.
 * Set a watchpoint on m.state and run (F5): See stops at every transition. */
#include <stdio.h>
#include "vending.h"

int main(void)
{
    struct machine m;
    char word[8];
    int amount;
    enum state before;

    machine_init(&m, 2, 60);

    /* c N = coin of N cents, s = select, r = refund, d = drink delivered */
    while (scanf("%7s", word) == 1) {
        before = m.state;
        if (word[0] == 'c' && scanf("%d", &amount) == 1) {
            printf("coin %d\n", amount);
            machine_handle(&m, EV_COIN, amount);
        } else if (word[0] == 's') {
            printf("select\n");
            machine_handle(&m, EV_SELECT, 0);
        } else if (word[0] == 'r') {
            printf("refund\n");
            machine_handle(&m, EV_REFUND, 0);
        } else if (word[0] == 'd') {
            printf("done\n");
            machine_handle(&m, EV_DONE, 0);
        }
        if (m.state != before) {
            printf("  [%s -> %s]\n", state_name(before), state_name(m.state));
        }
    }
    printf("takings %d cents, stock %d\n", m.takings, m.stock);
    return 0;
}

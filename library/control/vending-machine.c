/*
 * title: Vending machine state machine
 * level: 4
 * about: Drives a coin-operated vending machine through its states with a switch inside a loop, fed by a canned event script.
 * input: c 50\nc 20\ns A\nc 100\ns B\nr\ns C\nc 200\nc 100\nc 20\ns C\nc 10\ns A\nr\nc 50\nx
 */
#include <stdio.h>

/* A state machine is a variable that remembers "where we are", and a
   loop that reads an event and decides, from the state and the event,
   what to do and which state comes next. switch on the state is the
   standard C shape for it. */
enum state { IDLE, PAYING, VENDING, CHANGE, DONE };

int main(void)
{
    static const char *state_name[] = { "IDLE", "PAYING", "VENDING", "CHANGE", "DONE" };
    static const char *item_name[] = { "crisps", "chocolate", "juice" };
    static const int price[] = { 60, 80, 120 };
    enum state st = IDLE;
    int credit = 0;      /* pence put in so far */
    int sales = 0;       /* pence taken today */
    int item = -1;
    int coin;
    char ev, sel;

    while (st != DONE) {
        /* VENDING and CHANGE do their work without waiting for input:
           these are "automatic" states that move straight on. */
        if (st == VENDING || st == CHANGE) {
            ev = 0;
        } else if (scanf(" %c", &ev) != 1) {
            ev = 'x';    /* no more events: shut down */
        }

        switch (st) {
        case IDLE:
        case PAYING:
            /* Idle and paying behave alike apart from refunds, so they
               share a case. */
            switch (ev) {
            case 'c':
                scanf("%d", &coin);
                if (coin != 10 && coin != 20 && coin != 50 && coin != 100) {
                    printf("  rejected %dp coin\n", coin);
                    break;
                }
                credit += coin;
                printf("  credit %dp\n", credit);
                st = PAYING;
                break;
            case 's':
                scanf(" %c", &sel);
                if (sel < 'A' || sel > 'C') {
                    printf("  no slot %c\n", sel);
                    break;
                }
                item = sel - 'A';
                if (credit < price[item]) {
                    printf("  %s costs %dp, %dp more please\n",
                           item_name[item], price[item], price[item] - credit);
                    item = -1;
                } else {
                    st = VENDING;
                }
                break;
            case 'r':
                if (st == PAYING)
                    st = CHANGE;     /* refund is just "give change, buy nothing" */
                else
                    printf("  nothing to refund\n");
                break;
            case 'x':
                if (credit > 0)
                    printf("  returning %dp before shutdown\n", credit);
                credit = 0;
                st = DONE;
                break;
            default:
                printf("  unknown event '%c'\n", ev);
            }
            break;

        case VENDING:
            printf("  *clunk* one %s\n", item_name[item]);
            credit -= price[item];
            sales += price[item];
            item = -1;
            st = CHANGE;
            /* Setting st is all it takes to move on: the outer loop comes
               round and the CHANGE case runs next. */
            break;

        case CHANGE:
            /* Pay change greedily in the largest coins. The inner while
               loops are a little greedy algorithm of their own. Every
               price and coin is a multiple of 10p, so nothing is ever
               left over. */
            if (credit > 0) {
                printf("  change:");
                while (credit >= 50) { printf(" 50p"); credit -= 50; }
                while (credit >= 20) { printf(" 20p"); credit -= 20; }
                while (credit >= 10) { printf(" 10p"); credit -= 10; }
                printf("\n");
            }
            st = IDLE;
            break;

        case DONE:
            break;   /* never reached: the while test stops first */
        }
        printf("[%s]\n", state_name[st]);
    }
    printf("machine off, took %dp\n", sales);
    return 0;
}

/*
 * title: A vending machine menu driven by enums
 * level: 2
 * about: Reads menu choices, inserts coins and buys snacks, using one enum for menu options and another for the result of each purchase.
 * input: 1 50\n1 20\n2 3\n2 1\n1 100\n2 1\n2 2\n3\n4\n
 */
#include <stdio.h>

/* Explicit values let the enum match what the user types. */
enum choice { INSERT = 1, BUY = 2, REFUND = 3, QUIT = 4 };

/* A function that can fail in several ways reports which way with an enum.
   The caller switches on it instead of guessing from magic numbers. */
enum result { OK, NO_SUCH_ITEM, SOLD_OUT, NOT_ENOUGH_MONEY };

struct slot {
    const char *snack;
    int price;      /* in cents */
    int left;
};

enum result buy(struct slot *slots, int nslots, int which, int *credit)
{
    struct slot *s;
    if (which < 1 || which > nslots)
        return NO_SUCH_ITEM;
    s = &slots[which - 1];
    if (s->left == 0)
        return SOLD_OUT;
    if (*credit < s->price)
        return NOT_ENOUGH_MONEY;
    s->left--;
    *credit -= s->price;
    return OK;
}

int main(void)
{
    struct slot slots[2] = { { "crisps", 60, 2 }, { "apple", 40, 1 } };
    int credit = 0, option, arg, running = 1;

    printf("menu: 1 insert coins, 2 buy item, 3 refund, 4 quit\n");
    while (running && scanf("%d", &option) == 1) {
        switch ((enum choice)option) {
        case INSERT:
            if (scanf("%d", &arg) == 1) {
                credit += arg;
                printf("credit %d\n", credit);
            }
            break;
        case BUY:
            if (scanf("%d", &arg) != 1)
                break;
            switch (buy(slots, 2, arg, &credit)) {
            case OK:
                printf("enjoy your %s, credit %d\n", slots[arg - 1].snack, credit);
                break;
            case NO_SUCH_ITEM:
                printf("there is no item %d\n", arg);
                break;
            case SOLD_OUT:
                printf("%s is sold out\n", slots[arg - 1].snack);
                break;
            case NOT_ENOUGH_MONEY:
                printf("%s costs %d, you have %d\n", slots[arg - 1].snack,
                       slots[arg - 1].price, credit);
                break;
            }
            break;
        case REFUND:
            printf("returning %d\n", credit);
            credit = 0;
            break;
        case QUIT:
            running = 0;
            break;
        default:
            printf("no option %d\n", option);
        }
    }
    printf("goodbye\n");
    return 0;
}

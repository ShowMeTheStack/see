/*
 * title: Bank accounts in their own module
 * level: 2
 * about: Reads deposit, withdraw and transfer commands and applies them to three accounts, refusing overdrafts.
 * input: d 1 5000\nd 2 2500\nw 1 1200\nt 1 3 2000\nw 2 9999\nt 3 2 500\nq\n
 */

/* The folder holds main.c, account.c and account.h. See compiles each .c
 * file and links them into one program; account.h makes sure both files
 * agree on the layout of struct account. */
#include <stdio.h>
#include "account.h"

#define NACC 3

int main(void)
{
    struct account bank[NACC];
    char cmd;
    int a, b;
    long amount;
    int i, ok;

    account_open(&bank[0], 1, "Asha");
    account_open(&bank[1], 2, "Ben");
    account_open(&bank[2], 3, "Chen");

    /* Each line: d acct cents, w acct cents, t from to cents, or q. */
    while (scanf(" %c", &cmd) == 1 && cmd != 'q') {
        ok = 0;
        if (cmd == 'd' || cmd == 'w') {
            if (scanf("%d %ld", &a, &amount) != 2 || a < 1 || a > NACC) {
                break;
            }
            if (cmd == 'd') {
                ok = account_deposit(&bank[a - 1], amount);
            } else {
                ok = account_withdraw(&bank[a - 1], amount);
            }
            printf("%c %d %ld: %s\n", cmd, a, amount, ok ? "done" : "refused");
        } else if (cmd == 't') {
            if (scanf("%d %d %ld", &a, &b, &amount) != 3 || a < 1 || a > NACC || b < 1 || b > NACC) {
                break;
            }
            ok = account_transfer(&bank[a - 1], &bank[b - 1], amount);
            printf("t %d->%d %ld: %s\n", a, b, amount, ok ? "done" : "refused");
        }
    }

    printf("final balances:\n");
    for (i = 0; i < NACC; i++) {
        account_print(&bank[i]);
    }
    return 0;
}

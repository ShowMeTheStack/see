/* account.c - the rules of the bank. Every change to a balance goes through
 * here, so the rules (no negative amounts, no overdrafts) live in one place. */
#include <stdio.h>
#include <string.h>
#include "account.h"

void account_open(struct account *a, int number, const char *owner)
{
    a->number = number;
    strncpy(a->owner, owner, NAME_LEN - 1);
    a->owner[NAME_LEN - 1] = '\0';   /* strncpy may not terminate; we make sure */
    a->cents = 0;
}

int account_deposit(struct account *a, long cents)
{
    if (cents <= 0) {
        return 0;
    }
    a->cents += cents;
    return 1;
}

int account_withdraw(struct account *a, long cents)
{
    if (cents <= 0 || cents > a->cents) {
        return 0;
    }
    a->cents -= cents;
    return 1;
}

/* A transfer is a withdrawal that only goes ahead if it succeeded, then a
 * deposit. Both accounts arrive by pointer: in See the two arrows go from
 * this frame back into the array in main's frame. */
int account_transfer(struct account *from, struct account *to, long cents)
{
    if (!account_withdraw(from, cents)) {
        return 0;
    }
    account_deposit(to, cents);
    return 1;
}

void account_print(const struct account *a)
{
    printf("  #%d %-8s %6ld.%02ld\n", a->number, a->owner, a->cents / 100, a->cents % 100);
}

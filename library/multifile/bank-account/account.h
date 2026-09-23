/* account.h - a bank account and the operations allowed on it.
 * Money is kept in whole cents in a long, so there is no rounding trouble
 * that a double would bring. */
#ifndef ACCOUNT_H
#define ACCOUNT_H

#define NAME_LEN 16

struct account {
    int number;
    char owner[NAME_LEN];
    long cents;
};

void account_open(struct account *a, int number, const char *owner);
int account_deposit(struct account *a, long cents);
int account_withdraw(struct account *a, long cents);
int account_transfer(struct account *from, struct account *to, long cents);
void account_print(const struct account *a);

#endif

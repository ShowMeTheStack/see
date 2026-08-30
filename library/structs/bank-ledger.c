/*
 * title: Bank accounts with a transaction log
 * level: 2
 * about: Applies deposits, withdrawals and transfers to account structs, rejects bad ones with an error enum, and prints statements from a log of transaction structs.
 */
#include <stdio.h>

enum status { DONE, NO_FUNDS, BAD_AMOUNT, SAME_ACCOUNT };

struct account {
    int number;
    const char *owner;
    long balance;          /* in cents, so no rounding surprises */
};

enum kind { DEPOSIT, WITHDRAW, TRANSFER };

/* Each transaction records pointers to the accounts it touched, not copies.
   The log is an array of these, and in the memory picture its from/to
   fields are arrows into the accounts array. */
struct transaction {
    enum kind kind;
    struct account *from;
    struct account *to;
    long amount;
    enum status result;
};

const char *status_text(enum status s)
{
    switch (s) {
    case DONE: return "ok";
    case NO_FUNDS: return "refused: insufficient funds";
    case BAD_AMOUNT: return "refused: amount must be positive";
    case SAME_ACCOUNT: return "refused: same account";
    }
    return "?";
}

enum status apply(struct transaction *t)
{
    if (t->amount <= 0)
        return t->result = BAD_AMOUNT;
    if (t->kind == TRANSFER && t->from == t->to)
        return t->result = SAME_ACCOUNT;
    if (t->from != NULL && t->from->balance < t->amount)
        return t->result = NO_FUNDS;
    if (t->from != NULL)
        t->from->balance -= t->amount;
    if (t->to != NULL)
        t->to->balance += t->amount;
    return t->result = DONE;
}

void print_money(long cents)
{
    printf("%s%ld.%02ld", cents < 0 ? "-" : "", (cents < 0 ? -cents : cents) / 100,
           (cents < 0 ? -cents : cents) % 100);
}

void statement(const struct account *a, const struct transaction *log, int n)
{
    int i;
    printf("statement for %d (%s)\n", a->number, a->owner);
    for (i = 0; i < n; i++) {
        const struct transaction *t = &log[i];
        if (t->result != DONE || (t->from != a && t->to != a))
            continue;
        printf("  %s ", t->to == a ? "+" : "-");
        print_money(t->amount);
        if (t->kind == TRANSFER)
            printf("  %s %s", t->to == a ? "from" : "to", t->to == a ? t->from->owner : t->to->owner);
        printf("\n");
    }
    printf("  balance ");
    print_money(a->balance);
    printf("\n");
}

int main(void)
{
    struct account acc[3] = { { 1001, "Ines", 0 }, { 1002, "Kofi", 5000 }, { 1003, "Lena", 120000 } };
    struct transaction log[8];
    int n = 0, i;

#define ADD(k, f, t, amt) (log[n].kind = (k), log[n].from = (f), log[n].to = (t), \
                           log[n].amount = (amt), log[n].result = DONE, n++)
    ADD(DEPOSIT, NULL, &acc[0], 25000);
    ADD(WITHDRAW, &acc[1], NULL, 7500);
    ADD(TRANSFER, &acc[2], &acc[1], 30050);
    ADD(WITHDRAW, &acc[1], NULL, 7500);
    ADD(TRANSFER, &acc[0], &acc[0], 100);
    ADD(DEPOSIT, NULL, &acc[2], -500);
    ADD(TRANSFER, &acc[1], &acc[0], 12345);
#undef ADD

    for (i = 0; i < n; i++)
        printf("transaction %d: %s\n", i + 1, status_text(apply(&log[i])));
    printf("\n");
    for (i = 0; i < 3; i++)
        statement(&acc[i], log, n);
    return 0;
}

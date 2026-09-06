/*
 * title: Menu driven by a table of entries
 * level: 2
 * about: A small bank-account menu where each option is a struct holding a label and the function to run, read from canned input.
 * input: 1\n50\n2\n20\n3\n2\n500\n4\n3\n0
 */
#include <stdio.h>

static long balance = 100;
static int history = 0;

void show_balance(void)
{
    printf("  balance: %ld\n", balance);
}

void deposit(void)
{
    long amount;
    if (scanf("%ld", &amount) == 1 && amount > 0) {
        balance += amount;
        history++;
        printf("  deposited %ld\n", amount);
    }
}

void withdraw(void)
{
    long amount;
    if (scanf("%ld", &amount) != 1 || amount <= 0)
        return;
    if (amount > balance) {
        printf("  cannot withdraw %ld, only %ld available\n", amount, balance);
        return;
    }
    balance -= amount;
    history++;
    printf("  withdrew %ld\n", amount);
}

void show_history(void)
{
    printf("  %d transaction%s so far\n", history, history == 1 ? "" : "s");
}

/*
 * Each menu entry pairs some text with an action. Adding an option is
 * one new line in this table; the loop in main never changes.
 */
struct entry {
    const char *label;
    void (*action)(void);
};

const struct entry menu[] = {
    { "deposit",       deposit },
    { "withdraw",      withdraw },
    { "show balance",  show_balance },
    { "count history", show_history }
};
#define NMENU ((int)(sizeof menu / sizeof menu[0]))

int main(void)
{
    int choice, i;

    for (;;) {
        printf("menu:");
        for (i = 0; i < NMENU; i++)
            printf("  %d) %s", i + 1, menu[i].label);
        printf("  0) quit\n");

        if (scanf("%d", &choice) != 1 || choice == 0)
            break;
        if (choice < 1 || choice > NMENU) {
            printf("  no option %d\n", choice);
            continue;
        }
        printf("> %s\n", menu[choice - 1].label);
        /* Step into this call (F11): See jumps to whichever function the entry holds. */
        menu[choice - 1].action();
    }
    printf("goodbye, final balance %ld\n", balance);
    return 0;
}

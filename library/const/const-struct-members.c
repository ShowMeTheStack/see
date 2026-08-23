/*
 * title: Struct members that never change
 * level: 3
 * about: Gives each bank account a const id that is set once at creation, while the balance stays freely changeable.
 */
#include <stdio.h>
#include <string.h>

/*
 * id and owner's initial are const: an account keeps them forever. The
 * balance is an ordinary member. A struct with a const member can be
 * initialised, but never assigned as a whole afterwards.
 */
struct account {
    const int id;
    const char initial;
    long balance;
};

/* Deposits go through a plain pointer: only the balance is touched. */
void deposit(struct account *a, long amount)
{
    a->balance += amount;
    /* a->id = 0;   error: assignment of read-only member 'id' */
}

/* Reading only, so the parameter is a pointer to const. */
void show(const struct account *a)
{
    printf("account %d (%c): balance %ld\n", a->id, a->initial, a->balance);
}

int main(void)
{
    /*
     * The only way to give a const member its value is the initialiser,
     * in the order the members are declared.
     */
    struct account mine = { 1001, 'J', 50 };
    struct account yours = { 1002, 'K', 0 };
    struct account copy = { 1003, 'C', 0 };

    deposit(&mine, 25);
    deposit(&yours, 300);
    show(&mine);
    show(&yours);

    /*
     *     copy = mine;
     * is refused, because it would overwrite copy's const id:
     *     error: assignment of read-only variable 'copy'
     * Copying just the changeable parts is fine:
     */
    copy.balance = mine.balance;
    show(&copy);

    /* memcpy(&copy, &mine, sizeof copy) would compile, but it breaks the promise behind the compiler's back. */
    printf("struct size: %lu bytes\n", (unsigned long)sizeof(struct account));
    return 0;
}

/*
 * title: Making change with the fewest coins
 * level: 2
 * about: Reads an amount in cents and works out how many of each coin to hand back, largest coin first.
 * input: 289
 */
#include <stdio.h>

int main(void)
{
    /* The coin values, largest first, and a name for each. An array of
       strings is an array of pointers: in See each element is an arrow to
       a string literal in the read-only area. */
    int coins[6];
    const char *names[6];
    int amount;
    int left;
    int count;
    int total_coins = 0;
    int i;

    coins[0] = 200; names[0] = "two-euro";
    coins[1] = 100; names[1] = "one-euro";
    coins[2] = 50;  names[2] = "fifty-cent";
    coins[3] = 20;  names[3] = "twenty-cent";
    coins[4] = 10;  names[4] = "ten-cent";
    coins[5] = 5;   names[5] = "five-cent";

    printf("Amount in cents: ");
    scanf("%d", &amount);
    printf("%d\n", amount);

    /*
     * The greedy rule: give as many of the biggest coin as fit, then move
     * to the next. Integer division counts the coins, the remainder is
     * what still has to be paid. For euro coins this always gives the
     * fewest coins (it does not for every coin system).
     */
    left = amount;
    for (i = 0; i < 6; i++) {
        count = left / coins[i];
        left = left % coins[i];
        if (count > 0) {
            printf("%2d x %-12s (%3d cents)\n", count, names[i], count * coins[i]);
            total_coins += count;
        }
    }

    printf("%d coins in all", total_coins);
    if (left > 0) {
        /* The smallest coin here is 5 cents, so a few cents may remain. */
        printf(", and %d cents that no coin covers", left);
    }
    printf("\n");
    return 0;
}

/*
 * title: Coin change, greedy against optimal
 * level: 2
 * about: For amounts read from input, counts the ways to pay and the fewest coins needed, and shows where the greedy method goes wrong.
 * input: 6 16 30
 */
#include <stdio.h>

#define NCOINS 4
#define MAXAMT 100

/* An odd coin system: 1, 3, 4 and 10. Greedy fails on it. */
int coins[NCOINS] = { 1, 3, 4, 10 };

/*
 * ways[a]: how many multisets of coins add up to a. Looping over coins
 * on the outside counts {1,3} and {3,1} once; swap the loops and you
 * count ordered sequences instead. A classic trap.
 */
long count_ways(int amount)
{
    long ways[MAXAMT + 1];
    int a, c;
    ways[0] = 1;
    for (a = 1; a <= amount; a++)
        ways[a] = 0;
    for (c = 0; c < NCOINS; c++)
        for (a = coins[c]; a <= amount; a++)
            ways[a] += ways[a - coins[c]];
    return ways[amount];
}

/*
 * fewest[a]: fewest coins that make a, and last[a] the coin used last,
 * so the actual coins can be listed by walking last[] down to zero.
 */
int min_coins(int amount, int last[])
{
    int fewest[MAXAMT + 1];
    int a, c;
    fewest[0] = 0;
    for (a = 1; a <= amount; a++) {
        fewest[a] = MAXAMT + 1;     /* "impossible" */
        for (c = 0; c < NCOINS; c++)
            if (coins[c] <= a && fewest[a - coins[c]] + 1 < fewest[a]) {
                fewest[a] = fewest[a - coins[c]] + 1;
                last[a] = coins[c];
            }
    }
    return fewest[amount];
}

/* Greedy: always take the biggest coin that still fits. */
int greedy(int amount)
{
    int c, n = 0;
    printf("  greedy :");
    for (c = NCOINS - 1; c >= 0; c--)
        while (amount >= coins[c]) {
            amount -= coins[c];
            printf(" %d", coins[c]);
            n++;
        }
    printf("  (%d coins)\n", n);
    return n;
}

int main(void)
{
    int last[MAXAMT + 1];
    int amount, n, a, g;

    while (scanf("%d", &amount) == 1) {
        if (amount < 1 || amount > MAXAMT) {
            printf("amount must be 1..%d\n", MAXAMT);
            continue;
        }
        printf("amount %d: %ld ways to pay\n", amount, count_ways(amount));
        g = greedy(amount);
        n = min_coins(amount, last);
        printf("  optimal:");
        for (a = amount; a > 0; a -= last[a])
            printf(" %d", last[a]);
        printf("  (%d coins)%s\n", n, g > n ? "  greedy was worse" : "");
    }
    return 0;
}

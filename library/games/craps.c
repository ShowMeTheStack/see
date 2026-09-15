/*
 * title: Craps with a bankroll
 * level: 1
 * about: Plays rounds of craps for bets read from stdin: 7 or 11 wins at once, 2, 3 or 12 loses, anything else becomes the point to roll again before a 7.
 * input: 10\n500\n20\n15\n50\n25\n0\n
 */
#include <stdio.h>
#include <stdlib.h>

static int die(void)
{
    return rand() / (RAND_MAX / 6 + 1) + 1;
}

/* Plays one round, returns 1 for a win and 0 for a loss. */
static int play_round(void)
{
    int a = die(), b = die();
    int sum = a + b, point;

    printf("  come-out roll %d + %d = %d", a, b, sum);
    switch (sum) {
    case 7:
    case 11:
        printf(" natural!\n");
        return 1;
    case 2:
    case 3:
    case 12:
        printf(" craps.\n");
        return 0;
    default:
        point = sum;
        printf(", point is %d\n", point);
    }
    /* Keep rolling until the point comes again (win) or a 7 (lose). */
    for (;;) {
        a = die();
        b = die();
        sum = a + b;
        printf("  roll %d + %d = %d\n", a, b, sum);
        if (sum == point)
            return 1;
        if (sum == 7)
            return 0;
    }
}

int main(void)
{
    int money = 100, bet;

    srand(711);
    printf("You have %d. Bet 0 to stop.\n", money);
    while (money > 0) {
        printf("bet: ");
        if (scanf("%d", &bet) != 1 || bet == 0) {
            printf("0\n");
            break;
        }
        printf("%d\n", bet);
        if (bet < 0 || bet > money) {
            printf("You can bet 1 to %d.\n", money);
            continue;
        }
        if (play_round()) {
            money += bet;
            printf("  you win %d, now %d\n", bet, money);
        } else {
            money -= bet;
            printf("  you lose %d, now %d\n", bet, money);
        }
    }
    printf("You walk away with %d.\n", money);
    return 0;
}

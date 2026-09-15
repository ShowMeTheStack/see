/*
 * title: Pig, the push-your-luck dice game
 * level: 2
 * about: Race to 30 against a computer: roll to build a turn total, hold to bank it, but a 1 wipes the turn; the computer always holds at 10.
 * input: r\nr\nh\nr\nr\nh\nr\nr\n
 */
#include <stdio.h>
#include <stdlib.h>

#define GOAL 30

static int roll(void)
{
    /* rand() / (RAND_MAX / 6 + 1) splits 0..32767 into six equal bands
       of 5462 and gives 0..5. It uses the HIGH bits of rand's result,
       which in the classic generator are more random than the low bits
       that rand() % 6 would look at. */
    return rand() / (RAND_MAX / 6 + 1) + 1;
}

/* Play one turn for whoever is moving. human says whether to ask stdin.
   Returns the points banked this turn (0 if a 1 was rolled). */
static int turn(const char *who, int human, int banked)
{
    int total = 0, die;
    char cmd;

    for (;;) {
        die = roll();
        printf("  %s rolls %d", who, die);
        if (die == 1) {
            printf(" - pig! turn lost\n");
            return 0;
        }
        total += die;
        printf(", turn total %d\n", total);
        if (banked + total >= GOAL)
            return total;               /* no point rolling further */
        if (human) {
            printf("  roll again or hold? ");
            if (scanf(" %c", &cmd) != 1)
                cmd = 'h';
            printf("%c\n", cmd);
            if (cmd == 'h')
                return total;
        } else if (total >= 10) {
            printf("  %s holds\n", who);
            return total;
        }
    }
}

int main(void)
{
    int you = 0, cpu = 0;

    srand(1);
    while (you < GOAL && cpu < GOAL) {
        printf("You %d, computer %d. Your turn:\n", you, cpu);
        you += turn("you", 1, you);
        if (you >= GOAL)
            break;
        printf("Computer's turn:\n");
        cpu += turn("computer", 0, cpu);
    }
    printf("Final: you %d, computer %d. %s\n", you, cpu,
           you >= GOAL ? "You win!" : "The computer wins.");
    return 0;
}

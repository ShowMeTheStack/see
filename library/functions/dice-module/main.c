/*
 * title: A dice game split across files
 * level: 3
 * about: Plays a fixed-seed game of Pig against itself, with the random number generator kept private in its own module.
 */
#include <stdio.h>
#include "rng.h"

/* main.c only knows what rng.h tells it. In See's globals view the
   module's hidden state and calls still appear (they are real memory),
   but this file has no way to name them. */

/* One turn of Pig: keep rolling until a 1 (lose the turn's points) or
   until the turn total reaches the player's courage. */
int play_turn(const char *who, int courage)
{
    int turn = 0, die;

    printf("  %s rolls:", who);
    for (;;) {
        die = rng_range(1, 6);
        printf(" %d", die);
        if (die == 1) {
            printf("  -> bust\n");
            return 0;
        }
        turn += die;
        if (turn >= courage) {
            printf("  -> banks %d\n", turn);
            return turn;
        }
    }
}

int main(void)
{
    int score[2];
    const char *name[2];
    int courage[2];
    int who = 0, round = 1;

    name[0] = "Careful"; courage[0] = 12; score[0] = 0;
    name[1] = "Bold";    courage[1] = 25; score[1] = 0;

    rng_seed(2024);   /* fixed seed: the same game every run */

    while (score[0] < 60 && score[1] < 60) {
        if (who == 0)
            printf("round %d\n", round++);
        score[who] += play_turn(name[who], courage[who]);
        who = 1 - who;
    }
    printf("final: %s %d, %s %d\n", name[0], score[0], name[1], score[1]);
    printf("%s wins after %ld dice\n",
           score[0] >= 60 ? name[0] : name[1], rng_calls());
    return 0;
}

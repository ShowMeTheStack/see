/*
 * title: Mastermind with black and white pegs
 * level: 2
 * about: Hides a code of four colours and scores each guess with black pegs for right colour in the right place and white pegs for right colour in the wrong place.
 * input: RRGG\nBBYY\nRGX\nOPPO\nYPPG\nGPPY\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define PEGS 4
#define TURNS 10

static const char colours[] = "RGBYOP";    /* red green blue yellow orange purple */

/* Blacks are easy: same colour, same position. Whites are the subtle
   part. Count each colour in the code and in the guess; the number of
   colours they share is the sum of the smaller counts. Those shared pegs
   that are not already blacks are the whites. */
static void score(const char *code, const char *guess, int *black, int *white)
{
    int in_code[6], in_guess[6];
    int i, k, common = 0;

    memset(in_code, 0, sizeof in_code);
    memset(in_guess, 0, sizeof in_guess);
    *black = 0;
    for (i = 0; i < PEGS; i++) {
        if (code[i] == guess[i])
            (*black)++;         /* brackets matter: *black++ would move the pointer */
        in_code[strchr(colours, code[i]) - colours]++;
        in_guess[strchr(colours, guess[i]) - colours]++;
    }
    for (k = 0; k < 6; k++)
        common += in_code[k] < in_guess[k] ? in_code[k] : in_guess[k];
    *white = common - *black;
}

static int valid(const char *g)
{
    int i;

    if (strlen(g) != PEGS)
        return 0;
    for (i = 0; i < PEGS; i++)
        if (strchr(colours, g[i]) == NULL)
            return 0;
    return 1;
}

int main(void)
{
    char code[PEGS + 1];
    char guess[16];
    int i, turn = 0, black, white;

    srand(42);
    for (i = 0; i < PEGS; i++)
        code[i] = colours[rand() % 6];
    code[PEGS] = '\0';

    printf("Guess my %d-peg code. Colours: %s\n", PEGS, colours);
    while (turn < TURNS) {
        printf("guess %2d: ", turn + 1);
        if (scanf("%15s", guess) != 1) {
            printf("\nThe code was %s.\n", code);
            return 0;
        }
        printf("%s", guess);
        if (!valid(guess)) {
            printf("  (use %d letters from %s)\n", PEGS, colours);
            continue;
        }
        turn++;
        score(code, guess, &black, &white);
        printf("  black %d  white %d  ", black, white);
        for (i = 0; i < black; i++)
            putchar('#');
        for (i = 0; i < white; i++)
            putchar('o');
        putchar('\n');
        if (black == PEGS) {
            printf("Cracked in %d guesses!\n", turn);
            return 0;
        }
    }
    printf("Out of guesses. The code was %s.\n", code);
    return 0;
}

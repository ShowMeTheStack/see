/*
 * title: Five-letter word guessing with colour clues
 * level: 2
 * about: A Wordle-style game: each guess is marked letter by letter as right place, elsewhere in the word, or absent, counting repeated letters correctly.
 * input: crane\nCRANE\nghost\ntooth\nshout\nsouth\n
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

#define LEN 5

/* Mark each letter: 'G' green (right place), 'Y' yellow (in the word,
   elsewhere), '-' grey. Two passes are needed for repeated letters:
   greens first use up their letter, and only the letters left over can
   make yellows. Guess "tooth" against "south": the o in the middle is
   green, and the second o must be grey - south has only one o, and the
   green one has already used it. */
static void mark(const char *answer, const char *guess, char *out)
{
    int left[26];
    int i;

    memset(left, 0, sizeof left);
    for (i = 0; i < LEN; i++) {
        if (guess[i] == answer[i])
            out[i] = 'G';
        else {
            out[i] = '-';
            left[answer[i] - 'a']++;    /* letters still available */
        }
    }
    for (i = 0; i < LEN; i++) {
        if (out[i] != 'G' && left[guess[i] - 'a'] > 0) {
            out[i] = 'Y';
            left[guess[i] - 'a']--;
        }
    }
    out[LEN] = '\0';
}

static int all_lower(const char *s)
{
    for (; *s; s++)
        if (!islower((unsigned char)*s))
            return 0;
    return 1;
}

int main(void)
{
    const char *answer = "south";
    char guess[32], marks[LEN + 1];
    int turn = 0;

    printf("Guess the five-letter word. G = right place, Y = elsewhere, - = not in it.\n");
    while (turn < 6) {
        if (scanf("%31s", guess) != 1)
            break;
        if (strlen(guess) != LEN || !all_lower(guess)) {
            printf("%-8s (five lower-case letters, please)\n", guess);
            continue;
        }
        turn++;
        mark(answer, guess, marks);
        printf("%d: %s  %s\n", turn, guess, marks);
        if (strcmp(marks, "GGGGG") == 0) {
            printf("Solved in %d!\n", turn);
            return 0;
        }
    }
    printf("The word was %s.\n", answer);
    return 0;
}

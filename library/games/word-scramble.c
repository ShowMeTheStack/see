/*
 * title: Word scramble with a shuffled copy
 * level: 2
 * about: Shuffles the letters of secret words into a scrambled copy, reads guesses from stdin and gives a hint letter after each wrong one.
 * input: planet\nmelon\nlemon\nlaxagy\ngalyax\ngalaxi\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Shuffle a string in place (Fisher-Yates), but never hand back the word
   itself: a "scramble" that is still the word would be no puzzle. */
static void scramble(char *s)
{
    int n = (int)strlen(s), i, j;
    char t;
    char original[32];

    strcpy(original, s);
    do {
        for (i = n - 1; i > 0; i--) {
            j = rand() % (i + 1);
            t = s[i];
            s[i] = s[j];
            s[j] = t;
        }
    } while (strcmp(s, original) == 0);
}

int main(void)
{
    static const char *words[] = { "planet", "lemon", "galaxy" };
    char mixed[32];
    char guess[32];
    int w, tries, hints, score = 0;

    srand(31);
    for (w = 0; w < 3; w++) {
        /* words[w] points at a string literal, which must not be changed.
           So copy it into the array mixed and scramble the copy. In the
           memory picture, one sits with the literals, the other on the
           stack. */
        strcpy(mixed, words[w]);
        scramble(mixed);
        printf("\nUnscramble: %s\n", mixed);
        hints = 0;
        for (tries = 1; tries <= 3; tries++) {
            printf("guess: ");
            if (scanf("%31s", guess) != 1) {
                printf("\n");
                return 0;
            }
            printf("%s\n", guess);
            if (strcmp(guess, words[w]) == 0) {
                printf("Correct!\n");
                score += 3 - hints;
                break;
            }
            /* Hint: reveal the next letter of the answer. %.*s prints
               only the first hints characters of the word. */
            hints++;
            printf("No. It starts with \"%.*s\".\n", hints, words[w]);
        }
        if (tries > 3)
            printf("It was %s.\n", words[w]);
    }
    printf("\nscore %d of 9\n", score);
    return 0;
}

/*
 * title: Simon says, a growing sequence
 * level: 2
 * about: Adds one random colour each round to a sequence kept in a heap array that grows with realloc; you must type the whole sequence back to continue.
 * input: G\nGB\nGBY\nGBYY\nGBYYY\nGBYYYR\nGBYYRRG\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static const char colours[] = "RGBY";

int main(void)
{
    char *seq = NULL;       /* the sequence so far, on the heap */
    char *grown;
    char answer[64];
    int len = 0, round, i;

    srand(4);
    for (round = 1; round <= 10; round++) {
        /* Make room for one more colour plus the '\0'. realloc may move
           the block: watch seq's arrow in the heap view after this line. */
        grown = realloc(seq, len + 2);
        if (grown == NULL)
            break;
        seq = grown;
        seq[len++] = colours[rand() % 4];
        seq[len] = '\0';

        printf("round %d: Simon says ", round);
        for (i = 0; i < len; i++)
            printf("%c ", seq[i]);
        printf("\n  your turn: ");

        if (scanf("%63s", answer) != 1) {
            printf("\n  (no answer)\n");
            break;
        }
        printf("%s\n", answer);
        if (strcmp(answer, seq) != 0) {
            /* Find the first wrong colour to make the message helpful. */
            for (i = 0; answer[i] == seq[i]; i++)
                ;
            printf("  Wrong at colour %d: Simon said %c. Game over.\n", i + 1, seq[i] ? seq[i] : '-');
            break;
        }
        printf("  correct\n");
    }
    printf("You remembered %d colours.\n", round - 1);
    free(seq);
    return 0;
}

/*
 * title: Histogram of word lengths
 * level: 2
 * about: Counts how many words of each length appear in the input and draws the counts as a horizontal and a vertical bar chart.
 * input: It was the best of times, it was the worst of times,\nit was the age of wisdom, it was the age of foolishness\n
 */
#include <stdio.h>
#include <ctype.h>

#define MAXLEN 12   /* words this long or longer share the last bar */

int main(void)
{
    int count[MAXLEN + 1];
    int c, len = 0, i, row, tallest = 0;

    for (i = 0; i <= MAXLEN; i++)
        count[i] = 0;

    /* Letters make up words; anything else ends one. Commas are not
       counted as part of "times,". */
    while ((c = getchar()) != EOF) {
        if (isalpha(c)) {
            len++;
        } else if (len > 0) {
            count[len < MAXLEN ? len : MAXLEN]++;
            len = 0;
        }
    }
    if (len > 0)                 /* the input might end mid-word */
        count[len < MAXLEN ? len : MAXLEN]++;

    /* Horizontal: one row per length. */
    for (i = 1; i <= MAXLEN; i++) {
        printf("%2d%s |", i, i == MAXLEN ? "+" : " ");
        for (row = 0; row < count[i]; row++)
            putchar('#');
        printf(" %d\n", count[i]);
        if (count[i] > tallest)
            tallest = count[i];
    }
    printf("\n");

    /* Vertical is harder: print from the top row down, and in each row
       put a mark under every length whose bar reaches that high. */
    for (row = tallest; row > 0; row--) {
        for (i = 1; i <= MAXLEN; i++)
            printf(" %c ", count[i] >= row ? '#' : ' ');
        printf("\n");
    }
    for (i = 1; i <= MAXLEN; i++)
        printf("%2d ", i);
    printf("\n");
    return 0;
}

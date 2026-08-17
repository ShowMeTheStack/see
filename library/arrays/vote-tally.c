/*
 * title: Counting votes
 * level: 1
 * about: Reads ballot numbers, counts them in an array indexed by candidate, rejects spoiled ballots and declares a winner.
 * input: 2 1 3 2 2 5 1 3 2 0 3 1 2 -1
 */
#include <stdio.h>

#define CANDIDATES 3

int main(void)
{
    const char *who[CANDIDATES + 1] = { "", "Ada", "Brian", "Grace" };
    /* votes[1] .. votes[3] are used; slot 0 is wasted on purpose so the
       ballot number can be the index directly, with no "- 1" to forget. */
    int votes[CANDIDATES + 1] = { 0 };
    int b, i, spoiled = 0, winner = 1, cast = 0;

    while (scanf("%d", &b) == 1 && b >= 0) {
        /* Never trust input as an index. Ballot 5 would write past the end
           of the array, and See would stop the program right here. */
        if (b < 1 || b > CANDIDATES) {
            spoiled++;
            continue;
        }
        votes[b]++;
        cast++;
    }

    for (i = 1; i <= CANDIDATES; i++) {
        printf("%-6s %2d  %5.1f%%\n", who[i], votes[i], cast ? 100.0 * votes[i] / cast : 0.0);
        if (votes[i] > votes[winner])
            winner = i;
    }
    printf("spoiled ballots: %d\n", spoiled);
    printf("winner: %s\n", who[winner]);
    return 0;
}

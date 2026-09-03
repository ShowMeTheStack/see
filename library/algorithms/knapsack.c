/*
 * title: Packing a rucksack (0/1 knapsack)
 * level: 3
 * about: Chooses which camping items to pack for the most value within a weight limit, with a DP table and a backtrack to list the chosen items.
 */
#include <stdio.h>

#define NITEMS 6
#define CAP 10

struct item {
    const char *name;
    int weight;
    int value;
};

/*
 * best[i][w] = most value using only the first i items with capacity w.
 * For item i there are two choices: leave it (best[i-1][w]) or take it
 * if it fits (its value plus best[i-1][w - weight]). Each item is used
 * at most once because the "take" case looks at row i-1.
 */
int best[NITEMS + 1][CAP + 1];

int main(void)
{
    struct item items[NITEMS] = {
        { "tent",     5, 60 },
        { "stove",    3, 50 },
        { "sleeping", 4, 70 },
        { "camera",   2, 30 },
        { "books",    3, 10 },
        { "snacks",   1, 25 }
    };
    int i, w, take, used;

    for (w = 0; w <= CAP; w++)
        best[0][w] = 0;

    for (i = 1; i <= NITEMS; i++) {
        for (w = 0; w <= CAP; w++) {
            best[i][w] = best[i - 1][w];
            if (items[i - 1].weight <= w) {
                take = items[i - 1].value + best[i - 1][w - items[i - 1].weight];
                if (take > best[i][w])
                    best[i][w] = take;
            }
        }
    }

    printf("capacity:  ");
    for (w = 0; w <= CAP; w++)
        printf("%4d", w);
    printf("\n");
    for (i = 1; i <= NITEMS; i++) {
        printf("+%-9s:", items[i - 1].name);
        for (w = 0; w <= CAP; w++)
            printf("%4d", best[i][w]);
        printf("\n");
    }

    /*
     * Walk back up the table: if the value changed between row i-1 and
     * row i at this capacity, item i was taken.
     */
    printf("\npack:\n");
    w = CAP;
    used = 0;
    for (i = NITEMS; i > 0; i--) {
        if (best[i][w] != best[i - 1][w]) {
            printf("  %-9s weight %d, value %d\n",
                   items[i - 1].name, items[i - 1].weight, items[i - 1].value);
            w -= items[i - 1].weight;
            used += items[i - 1].weight;
        }
    }
    printf("total value %d, weight %d of %d\n", best[NITEMS][CAP], used, CAP);
    return 0;
}

/*
 * title: All subsets by include or exclude
 * level: 3
 * about: Lists every subset of a small set by deciding, one item at a time, to leave it out or put it in, then finds the subsets with a target sum.
 */
#include <stdio.h>

#define N 4

const char *fruit[N] = { "apple", "fig", "kiwi", "pear" };
int price[N] = { 3, 5, 2, 4 };

/* chosen[] is the path of decisions made so far. Each level of the
   recursion decides about one item, so the depth is always N + 1.
   The calls form a binary tree with 2^N leaves: one per subset. */
int chosen[N];

void print_subset(void)
{
    int i, any = 0, total = 0;

    printf("{");
    for (i = 0; i < N; i++)
        if (chosen[i]) {
            printf("%s%s", any ? ", " : " ", fruit[i]);
            any = 1;
            total += price[i];
        }
    printf("%s} costs %d\n", any ? " " : "", total);
}

void subsets(int i)
{
    if (i == N) {
        print_subset();
        return;
    }
    chosen[i] = 0;      /* branch 1: leave item i out */
    subsets(i + 1);
    chosen[i] = 1;      /* branch 2: put it in */
    subsets(i + 1);
    chosen[i] = 0;
}

/* Same tree, but stop going down a branch as soon as it is hopeless:
   once the running total passes the budget, no deeper call can help. */
int found = 0;

void with_sum(int i, int total, int target)
{
    if (total > target)
        return;                 /* prune */
    if (i == N) {
        if (total == target) {
            found++;
            print_subset();
        }
        return;
    }
    chosen[i] = 1;
    with_sum(i + 1, total + price[i], target);
    chosen[i] = 0;
    with_sum(i + 1, total, target);
}

int main(void)
{
    printf("all %d subsets:\n", 1 << N);
    subsets(0);

    printf("\nbaskets costing exactly 9:\n");
    with_sum(0, 0, 9);
    printf("%d found\n", found);
    return 0;
}

/*
 * title: Binary search, recursively
 * level: 2
 * about: Finds names in a sorted list by recursively halving the range, printing the range each call looks at.
 * input: kiwi\napple\nzucchini\nmango\nbanana\n
 */
#include <stdio.h>
#include <string.h>

#define N 11

const char *shelf[N] = {
    "apple", "banana", "cherry", "date", "fig", "grape",
    "kiwi", "lemon", "mango", "olive", "pear"
};

/* Look for key between positions lo and hi inclusive. Each call either
   finds it in the middle or hands one half to a new call. The range at
   least halves each time, so 11 names need at most 4 levels. Because
   the recursive call is the last thing done (its answer is returned
   unchanged), this is tail recursion: a loop would do the same job. */
int find(const char *key, int lo, int hi, int depth)
{
    int mid, cmp;

    printf("%*slooking in [%d..%d]", depth * 2, "", lo, hi);
    if (lo > hi) {
        printf(" empty\n");
        return -1;                      /* base case: nothing left */
    }
    mid = lo + (hi - lo) / 2;
    cmp = strcmp(key, shelf[mid]);
    printf(" middle is %s\n", shelf[mid]);
    if (cmp == 0)
        return mid;                     /* base case: found */
    if (cmp < 0)
        return find(key, lo, mid - 1, depth + 1);
    return find(key, mid + 1, hi, depth + 1);
}

int main(void)
{
    char key[32];
    int at;

    while (scanf("%31s", key) == 1) {
        printf("search for %s\n", key);
        at = find(key, 0, N - 1, 1);
        if (at >= 0)
            printf("  -> found at position %d\n", at);
        else
            printf("  -> not on the shelf\n");
    }
    return 0;
}

/*
 * title: Two pointers closing in
 * level: 2
 * about: Finds all pairs with a given sum in a sorted array and the pair closest to a target, walking two pointers towards each other.
 * input: 14 21
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int a[] = { 1, 3, 4, 5, 7, 7, 9, 10, 11, 13, 16 };
    int n = sizeof a / sizeof a[0];
    int *left, *right;          /* real pointers, so See draws two arrows into a[] */
    int target, sum, steps, best;
    int *best_l, *best_r;

    if (scanf("%d", &target) != 1)
        return 0;

    /*
     * Why this works: if a[left] + a[right] is too small, no pair using
     * a[left] can reach the target (right is already as big as it gets),
     * so left may move on. Symmetrically for too big. Each step discards
     * one item for good, so the whole walk is at most n steps instead of
     * the n*n/2 of trying every pair.
     */
    printf("pairs adding to %d:\n", target);
    left = a;
    right = a + n - 1;
    steps = 0;
    while (left < right) {
        steps++;
        sum = *left + *right;
        if (sum == target) {
            printf("  a[%d] + a[%d] = %d + %d\n", (int)(left - a), (int)(right - a), *left, *right);
            /* skip duplicates so 7+7 style repeats print once */
            while (left < right && left[1] == *left) left++;
            while (left < right && right[-1] == *right) right--;
            left++;
            right--;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    printf("  (%d steps)\n", steps);

    if (scanf("%d", &target) != 1)
        return 0;

    /* The same walk finds the pair whose sum is closest to a target. */
    left = a;
    right = a + n - 1;
    best_l = left;
    best_r = right;
    best = abs(*left + *right - target);
    while (left < right) {
        sum = *left + *right;
        if (abs(sum - target) < best) {
            best = abs(sum - target);
            best_l = left;
            best_r = right;
        }
        if (sum < target)
            left++;
        else
            right--;
    }
    printf("closest to %d: %d + %d = %d\n", target, *best_l, *best_r, *best_l + *best_r);
    return 0;
}

/*
 * title: Filtering, then shrinking with realloc
 * level: 2
 * about: Keeps only the prime numbers from a heap array, compacting them to the front in place, then uses realloc to hand back the unused tail of the block.
 * input: 20\n2 9 11 15 17 21 23 25 29 33 35 37 39 41 45 47 49 51 53 55
 */
#include <stdio.h>
#include <stdlib.h>

static int is_prime(int n)
{
    int d;
    if (n < 2)
        return 0;
    for (d = 2; d * d <= n; d++)
        if (n % d == 0)
            return 0;
    return 1;
}

int main(void)
{
    int *nums, *smaller;
    int n, i, kept = 0;

    if (scanf("%d", &n) != 1 || n < 1)
        return 0;
    nums = malloc(n * sizeof *nums);
    if (nums == NULL)
        return 0;
    for (i = 0; i < n; i++)
        if (scanf("%d", &nums[i]) != 1)
            nums[i] = 0;

    /*
     * Two indexes walk the same array: i reads every element, kept writes
     * only the ones we keep. kept never overtakes i, so nothing is lost.
     */
    for (i = 0; i < n; i++)
        if (is_prime(nums[i]))
            nums[kept++] = nums[i];

    printf("%d of %d are prime, block is %u bytes\n", kept, n, (unsigned)(n * sizeof *nums));

    /*
     * Shrinking never needs to move the data, so realloc usually keeps the
     * same address and just marks the tail as free. Watch the block in the
     * heap panel get shorter. Asking for 0 bytes is a special case (it may
     * free the block), so only shrink when something is left.
     */
    if (kept > 0) {
        smaller = realloc(nums, kept * sizeof *nums);
        if (smaller != NULL) {
            printf("shrunk to %u bytes, %s\n", (unsigned)(kept * sizeof *nums),
                   smaller == nums ? "same address" : "moved");
            nums = smaller;
        }
    }

    for (i = 0; i < kept; i++)
        printf("%d ", nums[i]);
    printf("\n");
    free(nums);
    return 0;
}

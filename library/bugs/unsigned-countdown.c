/*
 * title: Counting down with an unsigned index
 * level: 2
 * about: Prints a heap array backwards with an unsigned loop counter whose test i >= 0 is always true.
 * expect: fault warning
 */

/*
 * THE PUZZLE
 * The loop starts at the last element and stops when i drops below
 * zero. But i is unsigned. Can an unsigned number ever be below zero?
 * What does 0 - 1 give in unsigned arithmetic?
 *
 * The compiler gives a strong hint: build it (Ctrl+B) and read the
 * warning "comparison of unsigned expression >= 0 is always true".
 *
 * HOW TO HUNT IT WITH SEE
 * Debug with F5 and step through the loop (F10). The four numbers
 * print in reverse, i reaches 0, and then i-- turns it into 4294967295
 * (UINT_MAX on this 32-bit machine). The test i >= 0 is still true.
 * nums[4294967295] is computed as nums + 4294967295 * 4, which wraps
 * around the 32-bit address space to land 4 bytes BEFORE the block.
 * That is where the heap keeps the block's size, and See stops the
 * read. With a stack array the stray read might have hit a
 * neighbouring variable instead and printed nonsense for a while.
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    unsigned int n = 4;
    unsigned int i;
    int *nums = malloc(n * sizeof *nums);

    if (nums == NULL)
        return 1;
    for (i = 0; i < n; i++)
        nums[i] = (int)(i + 1) * 11;

    for (i = n - 1; i >= 0; i--)
        printf("%d\n", nums[i]);

    free(nums);
    return 0;
}

/*
 * THE FIX
 * Test before you decrement, so the counter never has to go below 0:
 *
 *     for (i = n; i > 0; i--)
 *         printf("%d\n", nums[i - 1]);
 *
 * or the compact idiom  i = n; while (i-- > 0) ...  where the test
 * sees the old value. gcc warns about "comparison is always true" only
 * with -Wextra, so do not count on being told.
 */

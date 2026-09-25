/*
 * title: Losing the block when realloc fails
 * level: 3
 * about: Grows an array of readings with p = realloc(p, ...), and loses everything when one request is too big.
 * input: 4\n12 15 11 14\n400000000\n
 * expect: fault
 */

/*
 * THE PUZZLE
 * The program reads a batch size and then that many readings, and
 * grows its array to make room. The first batch is fine. The second
 * batch claims 400 million readings, 1.6 GB of ints, far more than
 * there is memory for. realloc reports failure by returning NULL, and
 * when it does, the old block is left exactly as it was. So what
 * happens to the only pointer to that old block, on the realloc line?
 *
 * HOW TO HUNT IT WITH SEE
 * Put a breakpoint on the realloc line (F9) and run with F5. On the
 * second stop, look at the heap: one block holding the four readings,
 * with data's arrow pointing at it. Press F10. data is now 0 and the
 * arrow is gone, but the block is still there on the heap with nothing
 * pointing at it: a leak. A moment later the loop stores into
 * data[4], and See stops on an access near NULL, at address 16: that
 * is 0 + 4 * sizeof(int). Two bugs from one line.
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *data = NULL;
    unsigned long count = 0;
    unsigned long batch, i;

    while (scanf("%lu", &batch) == 1) {
        data = realloc(data, (count + batch) * sizeof *data);
        printf("room for %lu readings\n", count + batch);
        for (i = 0; i < batch; i++) {
            data[count + i] = 0;
            if (scanf("%d", &data[count + i]) != 1)
                break;
        }
        count += i;
    }

    for (i = 0; i < count; i++)
        printf("%d\n", data[i]);
    free(data);
    return 0;
}

/*
 * THE FIX
 * Keep the result in a separate pointer until you know it worked:
 *
 *     int *bigger = realloc(data, (count + batch) * sizeof *data);
 *     if (bigger == NULL) {
 *         printf("not enough memory for %lu more\n", batch);
 *         break;
 *     }
 *     data = bigger;
 *
 * Now a failure leaves data pointing at the readings you already have,
 * and they can still be printed and freed.
 */

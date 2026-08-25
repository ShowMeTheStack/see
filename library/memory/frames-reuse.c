/*
 * title: Two calls, one stack slot
 * level: 3
 * about: Calls two different functions one after the other from main and shows their locals land at the same stack address, because a frame is reused once its function returns.
 */
#include <stdio.h>

static void *where_a;
static void *where_b;

static int fill(int seed)
{
    int box[4];
    int i, sum = 0;

    for (i = 0; i < 4; i++) {
        box[i] = seed * (i + 1);
        sum += box[i];
    }
    where_a = box;
    return sum;
}

static int read_back(int start)
{
    int other[4];
    int i, sum = 0;

    /*
     * other[] sits exactly where box[] was a moment ago, and the old values
     * may still be lying there. C does not promise anything about them, and
     * See treats them as uninitialised, so we set them before reading.
     * Stop on the next line and compare the address with the one box had.
     */
    for (i = 0; i < 4; i++)
        other[i] = start + i;
    for (i = 0; i < 4; i++)
        sum += other[i];
    where_b = other;
    return sum;
}

int main(void)
{
    int a = fill(10);
    int b = read_back(1);

    printf("fill():      sum %3d, array at %p\n", a, where_a);
    printf("read_back(): sum %3d, array at %p\n", b, where_b);
    printf("%s\n", where_a == where_b ? "same address: the frame was reused"
                                      : "different addresses this time");

    /*
     * This is why returning the address of a local is a bug: the next call
     * moves into the same space and scribbles over it.
     */
    return 0;
}

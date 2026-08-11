/*
 * title: Duff's device
 * level: 4
 * about: Copies an array with a loop unrolled eight times, entering the middle of the loop through a switch that falls through.
 */
#include <stdio.h>

/* In 1983 Tom Duff needed a fast copy loop. Unrolling it (eight copies
   per pass instead of one) saves seven tests out of eight, but leaves a
   problem: what if the count is not a multiple of 8? His answer uses two
   facts about C:
     1. case labels are just labels; they may sit inside a loop that is
        inside the switch.
     2. without break, each case falls through into the next.
   So the switch jumps into the middle of the first pass to do the
   leftover count % 8 copies, and the do-while does full passes after
   that. It is legal C89, and it is a good test of whether you really
   understand switch. */
static void copy(int *to, const int *from, int count)
{
    int n = (count + 7) / 8;   /* number of passes, counting the partial one */

    if (count <= 0)
        return;
    switch (count % 8) {
    case 0: do { *to++ = *from++;
    case 7:      *to++ = *from++;
    case 6:      *to++ = *from++;
    case 5:      *to++ = *from++;
    case 4:      *to++ = *from++;
    case 3:      *to++ = *from++;
    case 2:      *to++ = *from++;
    case 1:      *to++ = *from++;
            } while (--n > 0);
    }
}

int main(void)
{
    int src[20];
    int dst[20];
    int i, count;

    for (i = 0; i < 20; i++)
        src[i] = i * i;

    /* Try a few counts, including ones that are and are not multiples of
       8. In See, step into copy (F11) with count 11 and watch the first
       jump land on "case 3": three copies, then the loop goes round once
       more for eight. Watch to and from creep along the two arrays. */
    for (count = 1; count <= 20; count += 5) {
        for (i = 0; i < 20; i++)
            dst[i] = -1;
        copy(dst, src, count);
        printf("count %2d:", count);
        for (i = 0; i < 20; i++)
            printf(" %d", dst[i]);
        printf("\n");
    }
    return 0;
}

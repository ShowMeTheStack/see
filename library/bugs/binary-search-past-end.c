/*
 * title: Binary search that looks one past the end
 * level: 3
 * about: Searches a sorted array with lo <= hi but starts hi at n instead of n - 1.
 * expect: fault
 */

/*
 * THE PUZZLE
 * Searching for 23 and 4 works. Searching for 99, bigger than every
 * element, crashes. Binary search keeps a window lo..hi of places
 * where the target could still be. With "while (lo <= hi)" both ends
 * are inside the window. Is a[hi] a real element when hi starts at n?
 *
 * HOW TO HUNT IT WITH SEE
 * Right-click the margin next to the line mid = ..., choose "Stop only
 * when..." and type mid == 8. Run with F5. When it stops, look at lo,
 * hi and mid in the frame: the window has slid all the way to the
 * right end, and mid is 8, but a has only a[0] to a[7]. Step once more
 * and See stops the read of a[8]. A smaller target never pushes the
 * window that far, which is why simple tests pass.
 */
#include <stdio.h>

static int find(const int *a, int n, int target)
{
    int lo = 0, hi = n, mid;

    while (lo <= hi) {
        mid = lo + (hi - lo) / 2;
        if (a[mid] == target)
            return mid;
        if (a[mid] < target)
            lo = mid + 1;
        else
            hi = mid - 1;
    }
    return -1;
}

int main(void)
{
    int a[8];
    int targets[3];
    int i;

    for (i = 0; i < 8; i++)
        a[i] = i * i + 4;
    targets[0] = 23;
    targets[1] = 4;
    targets[2] = 99;

    for (i = 0; i < 3; i++)
        printf("%d is at index %d\n", targets[i], find(a, 8, targets[i]));
    return 0;
}

/*
 * THE FIX
 * Pick one convention and stay with it. Either both ends inclusive:
 *     int lo = 0, hi = n - 1;   while (lo <= hi) ...   hi = mid - 1;
 * or the half-open window lo..hi-1:
 *     int lo = 0, hi = n;       while (lo < hi) ...    hi = mid;
 * Mixing the two is the classic binary search bug.
 */

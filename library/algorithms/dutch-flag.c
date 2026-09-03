/*
 * title: Dutch national flag partition
 * level: 2
 * about: Sorts an array of red, white and blue balls in one pass with three pointers, as Dijkstra described it.
 */
#include <stdio.h>

enum colour { RED, WHITE, BLUE };

void show(const enum colour a[], int n, int low, int mid, int high)
{
    const char *letter = "RWB";
    int i;
    for (i = 0; i < n; i++)
        putchar(letter[a[i]]);
    printf("   low=%2d mid=%2d high=%2d\n", low, mid, high);
}

int main(void)
{
    enum colour a[] = { BLUE, RED, WHITE, WHITE, BLUE, RED, RED, BLUE,
                        WHITE, RED, BLUE, WHITE, RED, WHITE };
    int n = sizeof a / sizeof a[0];
    int low = 0, mid = 0, high = n - 1;
    enum colour t;

    /*
     * Four regions at every moment:
     *   a[0 .. low-1]      red
     *   a[low .. mid-1]    white
     *   a[mid .. high]     not looked at yet
     *   a[high+1 .. n-1]   blue
     * Each step shrinks the unknown region by one, so it ends after n steps.
     */
    show(a, n, low, mid, high);
    while (mid <= high) {
        switch (a[mid]) {
        case RED:
            t = a[low]; a[low] = a[mid]; a[mid] = t;
            low++;
            mid++;
            break;
        case WHITE:
            mid++;
            break;
        case BLUE:
            /*
             * mid does not advance: the ball that came from high has
             * not been looked at yet.
             */
            t = a[high]; a[high] = a[mid]; a[mid] = t;
            high--;
            break;
        }
        show(a, n, low, mid, high);
    }
    printf("sorted in a single pass\n");
    return 0;
}

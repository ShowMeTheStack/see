/*
 * title: Heap sort drawn as a tree
 * level: 3
 * about: Builds a max-heap inside an array, prints it as a tree, then repeatedly moves the maximum to the end.
 */
#include <stdio.h>

static int comparisons = 0;

/*
 * In a heap stored in an array, the children of cell i are 2i+1 and
 * 2i+2, and its parent is (i-1)/2. No pointers are needed: the shape of
 * the tree is implied by the indices.
 */
void sift_down(int a[], int n, int i)
{
    int big, left, right, t;
    for (;;) {
        big = i;
        left = 2 * i + 1;
        right = 2 * i + 2;
        if (left < n) {
            comparisons++;
            if (a[left] > a[big]) big = left;
        }
        if (right < n) {
            comparisons++;
            if (a[right] > a[big]) big = right;
        }
        if (big == i)
            return;             /* parent is at least as big as both children */
        t = a[i]; a[i] = a[big]; a[big] = t;
        i = big;                /* follow the item down the tree */
    }
}

/* Print the first n cells level by level: 1, then 2, then 4 ... */
void print_tree(int a[], int n)
{
    int level_start = 0, width = 1, i;
    while (level_start < n) {
        printf("   ");
        for (i = level_start; i < level_start + width && i < n; i++)
            printf(" %3d", a[i]);
        printf("\n");
        level_start += width;
        width *= 2;
    }
}

int main(void)
{
    int a[] = { 16, 4, 10, 14, 7, 9, 3, 2, 8, 1, 12 };
    int n = sizeof a / sizeof a[0];
    int i, end, t;

    /*
     * Build the heap bottom-up: the leaves are already tiny heaps, so
     * start at the last parent and sift each parent down.
     */
    for (i = n / 2 - 1; i >= 0; i--)
        sift_down(a, n, i);
    printf("max-heap, one level per line:\n");
    print_tree(a, n);
    printf("building took %d comparisons\n", comparisons);

    /*
     * The root is the largest item. Swap it to the end of the array,
     * shrink the heap by one, and repair the root. The sorted part grows
     * from the right while the heap shrinks on the left.
     */
    for (end = n - 1; end > 0; end--) {
        t = a[0]; a[0] = a[end]; a[end] = t;
        sift_down(a, end, 0);
        printf("heap %2d | sorted:", end);
        for (i = end; i < n; i++)
            printf(" %d", a[i]);
        printf("\n");
    }

    printf("result:");
    for (i = 0; i < n; i++)
        printf(" %d", a[i]);
    printf("\ntotal comparisons: %d\n", comparisons);
    return 0;
}

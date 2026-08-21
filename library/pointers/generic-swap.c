/*
 * title: A swap for any type with void * and memcpy
 * level: 3
 * about: Writes one swap function that exchanges two objects of any size, then uses it to reverse arrays of ints, doubles and structs.
 */
#include <stdio.h>
#include <string.h>

/*
 * Without knowing the type we still know the size, and memcpy moves raw
 * bytes. The temporary buffer limits objects to 64 bytes, enough here.
 * Returns 0 if the object is too big.
 */
int swap_any(void *a, void *b, size_t size)
{
    unsigned char tmp[64];
    if (size > sizeof tmp)
        return 0;
    memcpy(tmp, a, size);
    memcpy(a, b, size);
    memcpy(b, tmp, size);
    return 1;
}

/*
 * void * cannot be stepped with arithmetic, so convert to unsigned char *,
 * whose steps are single bytes, and move by size bytes at a time.
 * This is how qsort and bsearch handle elements of unknown type.
 */
void reverse_any(void *base, size_t count, size_t size)
{
    unsigned char *lo = (unsigned char *)base;
    unsigned char *hi;
    if (count < 2)
        return;
    hi = lo + (count - 1) * size;
    while (lo < hi) {
        swap_any(lo, hi, size);
        lo += size;
        hi -= size;
    }
}

struct card {
    char suit;
    int rank;
};

int main(void)
{
    int nums[5];
    double halves[4];
    struct card hand[3];
    int x = 1, y = 2;
    int i;

    for (i = 0; i < 5; i++) nums[i] = i * i;
    for (i = 0; i < 4; i++) halves[i] = i / 2.0;
    /*
     * swap_any copies whole structs byte by byte, including the 3 padding
     * bytes after suit that no assignment ever fills. Zeroing the array
     * first gives those bytes a value, so nothing uninitialised is copied.
     */
    memset(hand, 0, sizeof hand);
    hand[0].suit = 'S'; hand[0].rank = 1;
    hand[1].suit = 'H'; hand[1].rank = 12;
    hand[2].suit = 'D'; hand[2].rank = 7;

    swap_any(&x, &y, sizeof x);
    printf("x = %d, y = %d\n", x, y);

    /* Step into reverse_any for the doubles and watch lo and hi jump 8 bytes at a time. */
    reverse_any(nums, 5, sizeof nums[0]);
    reverse_any(halves, 4, sizeof halves[0]);
    reverse_any(hand, 3, sizeof hand[0]);

    for (i = 0; i < 5; i++) printf("%d ", nums[i]);
    printf("\n");
    for (i = 0; i < 4; i++) printf("%.1f ", halves[i]);
    printf("\n");
    for (i = 0; i < 3; i++) printf("%c%d ", hand[i].suit, hand[i].rank);
    printf("\n");

    /* Passing the wrong size is the danger: the compiler cannot check it for you. */
    printf("a struct card is %lu bytes (the char is padded to 4)\n", (unsigned long)sizeof(struct card));
    return 0;
}

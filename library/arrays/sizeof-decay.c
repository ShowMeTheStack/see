/*
 * title: sizeof and the vanishing array
 * level: 2
 * about: Shows why sizeof gives the whole array in main but only a pointer's size inside a function.
 */
#include <stdio.h>

/* However it is spelled, this parameter is a pointer. "int a[]" and even
   "int a[100]" in a parameter list both mean "int *a". The array itself
   stays in main's frame; the function only receives its address. */
static void inside(int a[100], int n)
{
    printf("inside: sizeof a     = %lu  (just a pointer)\n", (unsigned long)sizeof a);
    printf("inside: sizeof a[0]  = %lu\n", (unsigned long)sizeof a[0]);
    printf("inside: the trick sizeof a / sizeof a[0] gives %lu, which is wrong\n",
           (unsigned long)(sizeof a / sizeof a[0]));
    printf("inside: so the caller passes the count: n = %d\n", n);
    /* Step into this function (F11) and look at the stack: 'a' is a 4-byte
       box holding an arrow back into main's frame. */
    a[0] = 99;
}

/* The honest way to write the same parameter. */
static int sum(const int *p, int n)
{
    int i, s = 0;
    for (i = 0; i < n; i++)
        s += p[i];
    return s;
}

/* A common helper macro. It only works where the real array is in scope. */
#define COUNT(arr) (sizeof (arr) / sizeof (arr)[0])

int main(void)
{
    int nums[7] = { 1, 2, 3, 4, 5, 6, 7 };
    int *p = nums;   /* the array name turns into a pointer to its first element */

    printf("main:   sizeof nums    = %lu  (7 ints of 4 bytes)\n", (unsigned long)sizeof nums);
    printf("main:   COUNT(nums)    = %lu\n", (unsigned long)COUNT(nums));
    printf("main:   sizeof p       = %lu  (p is a pointer, even though it points at nums)\n",
           (unsigned long)sizeof p);
    printf("main:   nums == p ? %s\n", nums == p ? "same address" : "different");

    inside(nums, (int)COUNT(nums));

    /* The function wrote through its pointer, so main's array changed. */
    printf("main:   nums[0] is now %d\n", nums[0]);
    printf("main:   sum = %d\n", sum(nums, (int)COUNT(nums)));
    return 0;
}

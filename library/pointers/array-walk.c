/*
 * title: Walking an array with a pointer
 * level: 1
 * about: Sums an array three ways, by index, by pointer offset and by moving a pointer, to show a[i] is *(a + i).
 */
#include <stdio.h>

#define N 6

int main(void)
{
    int a[N];
    int *p;
    int *end;
    int i;
    int sum1 = 0, sum2 = 0, sum3 = 0;

    for (i = 0; i < N; i++)
        a[i] = (i + 1) * (i + 1);       /* 1 4 9 16 25 36 */

    /* 1. The way everyone starts: an index. */
    for (i = 0; i < N; i++)
        sum1 += a[i];

    /*
     * 2. An array name used in an expression turns into a pointer to its
     *    first element. Adding i to an int pointer moves it i ints along,
     *    which is 4*i bytes on this machine, not i bytes. a[i] is defined
     *    to mean exactly *(a + i).
     */
    for (i = 0; i < N; i++)
        sum2 += *(a + i);

    /*
     * 3. A pointer that walks. end points one past the last element; that
     *    address may be computed and compared, but never dereferenced.
     *    Step through the loop and watch p's arrow slide along the array.
     */
    end = a + N;
    for (p = a; p != end; p++)
        sum3 += *p;

    printf("sums: %d %d %d\n", sum1, sum2, sum3);

    /* Each step of p is sizeof(int) bytes. */
    p = a;
    printf("a+0 = %p\n", (void *)p);
    printf("a+1 = %p  (4 bytes later)\n", (void *)(p + 1));
    printf("a+5 = %p  (20 bytes later)\n", (void *)(p + 5));

    /* Since a[i] is *(a+i) and addition commutes, i[a] works too. Please never write it. */
    printf("a[2] = %d, *(a+2) = %d, 2[a] = %d\n", a[2], *(a + 2), 2[a]);
    return 0;
}

/*
 * title: Returning several results in one struct
 * level: 1
 * about: Reads a list of numbers and returns their count, minimum, maximum and mean from one function as a struct.
 * input: 12 7 -3 25 9 14 0 8\n
 */
#include <stdio.h>

/* A function can return only one value, but that value may be a struct with
   as many fields as you like. This is often clearer than a long list of
   output pointers. */
struct stats {
    int count;
    int min;
    int max;
    double mean;
};

struct stats summarise(const int *a, int n)
{
    /* The brace list gives every byte of s a value, including the 4 unused
       padding bytes the compiler puts after max so that mean sits on an
       8-byte boundary. The return copies all of them. */
    struct stats s = { 0, 0, 0, 0.0 };
    int i;
    long sum = 0;

    s.count = n;
    s.min = a[0];
    s.max = a[0];
    for (i = 0; i < n; i++) {
        if (a[i] < s.min) s.min = a[i];
        if (a[i] > s.max) s.max = a[i];
        sum += a[i];
    }
    s.mean = (double)sum / n;
    /* Step over the return (F10) and watch the four fields of s appear in
       main's result variable as a single copy. */
    return s;
}

int main(void)
{
    int numbers[20];
    int n = 0;
    struct stats r;

    while (n < 20 && scanf("%d", &numbers[n]) == 1)
        n++;
    if (n == 0) {
        printf("no numbers\n");
        return 0;
    }

    r = summarise(numbers, n);
    printf("count %d\n", r.count);
    printf("min   %d\n", r.min);
    printf("max   %d\n", r.max);
    printf("range %d\n", r.max - r.min);
    printf("mean  %.3f\n", r.mean);

    /* You can also use a returned struct straight away without storing it. */
    printf("mean of the first three: %.3f\n", summarise(numbers, 3).mean);
    return 0;
}

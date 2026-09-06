/*
 * title: map, filter and reduce in C
 * level: 3
 * about: Writes map, filter and reduce helpers that take function parameters, then chains them to answer questions about an array of numbers.
 */
#include <stdio.h>
#include <stdlib.h>

typedef int (*unary)(int);
typedef int (*predicate)(int);
typedef int (*binary)(int, int);

/* map: out[i] = f(in[i]). out may be the same array as in. */
void map(const int in[], int out[], int n, unary f)
{
    int i;
    for (i = 0; i < n; i++)
        out[i] = f(in[i]);
}

/*
 * filter: returns a new heap array holding the items that pass, and
 * stores its length in *count. The caller must free it. Watch the heap
 * in See: each filter call leaves one block until main frees it.
 */
int *filter(const int in[], int n, predicate keep, int *count)
{
    int *out = malloc((n > 0 ? n : 1) * sizeof *out);
    int i, k = 0;
    if (out == NULL) {
        *count = 0;
        return NULL;
    }
    for (i = 0; i < n; i++)
        if (keep(in[i]))
            out[k++] = in[i];
    *count = k;
    return out;
}

/* reduce: fold the array into one value, starting from init. */
int reduce(const int in[], int n, binary f, int init)
{
    int i, acc = init;
    for (i = 0; i < n; i++)
        acc = f(acc, in[i]);
    return acc;
}

int square(int x)    { return x * x; }
int is_even(int x)   { return x % 2 == 0; }
int is_odd(int x)    { return x % 2 != 0; }
int over_20(int x)   { return x > 20; }
int add(int a, int b) { return a + b; }
int max(int a, int b) { return a > b ? a : b; }

void print(const char *label, const int a[], int n)
{
    int i;
    printf("%-22s", label);
    for (i = 0; i < n; i++)
        printf(" %d", a[i]);
    printf("\n");
}

int main(void)
{
    int nums[] = { 3, 8, 1, 6, 7, 2, 9, 4, 5, 10 };
    int n = sizeof nums / sizeof nums[0];
    int sq[10];
    int *evens, *big;
    int ne, nb;

    print("numbers:", nums, n);

    map(nums, sq, n, square);
    print("squares:", sq, n);

    evens = filter(nums, n, is_even, &ne);
    print("evens:", evens, ne);
    printf("%-22s %d\n", "sum of evens:", reduce(evens, ne, add, 0));

    /* Chain them: the largest odd square above 20. */
    big = filter(sq, n, over_20, &nb);
    print("squares over 20:", big, nb);
    free(evens);
    evens = filter(big, nb, is_odd, &ne);
    print("...that are odd:", evens, ne);
    printf("%-22s %d\n", "the largest of those:", reduce(evens, ne, max, 0));

    free(evens);
    free(big);
    return 0;
}

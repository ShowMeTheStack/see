/*
 * title: Radix sort digit by digit
 * level: 3
 * about: Sorts numbers by their last digit, then the tens, then the hundreds, using a stable counting pass each time.
 */
#include <stdio.h>
#include <stdlib.h>

void print_all(const char *label, int a[], int n)
{
    int i;
    printf("%-12s", label);
    for (i = 0; i < n; i++)
        printf(" %3d", a[i]);
    printf("\n");
}

/*
 * One stable counting sort on the digit (a[i] / place) % 10.
 * out is a heap buffer of the same size; the result is copied back.
 */
void pass(int a[], int out[], int n, int place)
{
    int count[10];
    int i, d, sum, c;

    for (d = 0; d < 10; d++)
        count[d] = 0;
    for (i = 0; i < n; i++)
        count[(a[i] / place) % 10]++;

    sum = 0;
    for (d = 0; d < 10; d++) {
        c = count[d];
        count[d] = sum;
        sum += c;
    }
    for (i = 0; i < n; i++)
        out[count[(a[i] / place) % 10]++] = a[i];
    for (i = 0; i < n; i++)
        a[i] = out[i];
}

int main(void)
{
    int a[] = { 170, 45, 75, 90, 802, 24, 2, 66, 315, 451, 9, 88 };
    int n = sizeof a / sizeof a[0];
    int *out;
    int place, max, i;
    char label[20];

    out = malloc(n * sizeof *out);
    if (out == NULL)
        return 0;

    max = a[0];
    for (i = 1; i < n; i++)
        if (a[i] > max)
            max = a[i];

    print_all("start", a, n);

    /*
     * Why does sorting by the least significant digit first work? Each
     * pass is stable, so when two numbers have the same hundreds digit
     * they keep the order the earlier passes gave them, which was by
     * tens and units. After the last pass the whole number is in order.
     * Look at 802 and 2: they tie on the last two digits until the end.
     */
    for (place = 1; max / place > 0; place *= 10) {
        pass(a, out, n, place);
        sprintf(label, "by %ds", place);
        print_all(label, a, n);
    }

    free(out);
    printf("%d numbers, no comparisons between them\n", n);
    return 0;
}

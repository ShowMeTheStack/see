/*
 * title: Several answers from one function
 * level: 2
 * about: Computes the minimum, maximum and mean of an array in one pass and hands all three back through pointer parameters.
 */
#include <stdio.h>

/*
 * A function returns only one value. To give back more, the caller passes
 * the addresses of its own variables and the function fills them in.
 * The return value is kept for "did it work?".
 */
int stats(const int *a, int n, int *min, int *max, double *mean)
{
    int i;
    long sum = 0;

    if (n <= 0)
        return 0;          /* nothing to measure; the outputs are left alone */

    *min = *max = a[0];
    for (i = 0; i < n; i++) {
        if (a[i] < *min) *min = a[i];
        if (a[i] > *max) *max = a[i];
        sum += a[i];
    }
    *mean = (double)sum / n;
    return 1;
}

/* Another classic: quotient and remainder together. */
void divide(int a, int b, int *quot, int *rem)
{
    *quot = a / b;
    *rem = a % b;
}

int main(void)
{
    int temps[7];
    int lo, hi, q, r;
    double avg;

    temps[0] = 14; temps[1] = 17; temps[2] = 9; temps[3] = 21;
    temps[4] = 18; temps[5] = 12; temps[6] = 16;

    /*
     * Step into stats (F11). The arrows from min, max and mean reach back
     * into main's frame; each assignment through them changes lo, hi, avg.
     */
    if (stats(temps, 7, &lo, &hi, &avg))
        printf("week: lowest %d, highest %d, mean %.2f\n", lo, hi, avg);

    if (!stats(temps, 0, &lo, &hi, &avg))
        printf("an empty week has no statistics\n");

    divide(100, 7, &q, &r);
    printf("100 = 7 * %d + %d\n", q, r);

    /* scanf is the best known function of this kind: it fills variables through the addresses you pass. */
    return 0;
}

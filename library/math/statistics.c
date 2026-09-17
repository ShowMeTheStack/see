/*
 * title: Statistics of a data set
 * level: 2
 * about: Reads numbers into a growing heap array, then reports mean, median, mode, range and standard deviation.
 * input: 12 7 3 21 7 15 9 7 30 12 4 18 9 12 7
 */
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

/* qsort needs a function that says which of two elements comes first.
   It gets untyped pointers, so convert them back to what they really
   point at. Returning (x > y) - (x < y) gives -1, 0 or 1 without the
   overflow that x - y could cause. */
int compare_doubles(const void *a, const void *b)
{
    double x = *(const double *)a, y = *(const double *)b;
    return (x > y) - (x < y);
}

int main(void)
{
    double *data = NULL, *bigger;
    int count = 0, capacity = 0, i, run, best_run;
    double v, sum = 0.0, mean, median, mode, sq = 0.0;

    /* Grow the array by doubling. Each realloc may move the block, so
       watch the heap panel: the old block disappears and a bigger one
       appears, with the numbers copied over. */
    while (scanf("%lf", &v) == 1) {
        if (count == capacity) {
            capacity = capacity ? capacity * 2 : 4;
            bigger = realloc(data, capacity * sizeof *data);
            if (bigger == NULL) {
                free(data);
                return 1;
            }
            data = bigger;
        }
        data[count++] = v;
        sum += v;
    }
    if (count == 0) {
        printf("no data\n");
        return 0;
    }

    mean = sum / count;
    qsort(data, count, sizeof *data, compare_doubles);

    /* With the data sorted, the median is the middle value (or the
       average of the two middle ones), and equal values sit together,
       so the mode is the longest run. */
    if (count % 2 == 1)
        median = data[count / 2];
    else
        median = (data[count / 2 - 1] + data[count / 2]) / 2.0;

    mode = data[0];
    best_run = 0;
    run = 0;
    for (i = 0; i < count; i++) {
        run = (i > 0 && data[i] == data[i - 1]) ? run + 1 : 1;
        if (run > best_run) {
            best_run = run;
            mode = data[i];
        }
    }

    /* Standard deviation: how far, on average, values sit from the
       mean. Two passes (mean first, then squared distances) is more
       accurate than the one-pass shortcut sum(x^2) - n*mean^2. */
    for (i = 0; i < count; i++)
        sq += (data[i] - mean) * (data[i] - mean);

    printf("sorted:");
    for (i = 0; i < count; i++)
        printf(" %g", data[i]);
    printf("\n");
    printf("count     %d\n", count);
    printf("mean      %.3f\n", mean);
    printf("median    %g\n", median);
    printf("mode      %g (appears %d times)\n", mode, best_run);
    printf("range     %g to %g\n", data[0], data[count - 1]);
    printf("std dev   %.3f (population), %.3f (sample)\n",
           sqrt(sq / count), count > 1 ? sqrt(sq / (count - 1)) : 0.0);

    free(data);
    return 0;
}

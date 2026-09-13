/*
 * title: External merge sort with run files
 * level: 4
 * about: Sorts a file of numbers too big for its tiny buffer by writing sorted runs to separate files, then merging all runs at once.
 */
#include <stdio.h>
#include <stdlib.h>

#define BUF   5         /* pretend memory only holds 5 numbers */
#define MAXRUNS 8

static int cmp_int(const void *a, const void *b)
{
    int x = *(const int *)a, y = *(const int *)b;

    return (x > y) - (x < y);   /* avoids the overflow of x - y */
}

int main(void)
{
    static const int data[] = { 42, 7, 19, 88, 3, 56, 21, 64, 9, 30,
                                71, 15, 2, 47, 95, 38, 11, 60 };
    FILE *in, *out;
    FILE *run[MAXRUNS];
    int head[MAXRUNS];          /* the front number of each run */
    int alive[MAXRUNS];         /* does run k still have a number? */
    char name[32];
    int buf[BUF];
    int nruns = 0, n, i, best, x, total = 0;

    in = fopen("/tmp/big.txt", "w");
    if (in == NULL) {
        perror("/tmp/big.txt");
        return 1;
    }
    for (i = 0; i < (int)(sizeof data / sizeof data[0]); i++)
        fprintf(in, "%d\n", data[i]);
    fclose(in);

    /* Phase 1: read BUF numbers, sort them in memory with qsort, write
       them out as one sorted "run" file. Repeat until the input is done. */
    in = fopen("/tmp/big.txt", "r");
    if (in == NULL) {
        perror("/tmp/big.txt");
        return 1;
    }
    for (;;) {
        n = 0;
        while (n < BUF && fscanf(in, "%d", &buf[n]) == 1)
            n++;
        if (n == 0 || nruns == MAXRUNS)
            break;
        qsort(buf, n, sizeof buf[0], cmp_int);
        sprintf(name, "/tmp/run%d.txt", nruns);
        out = fopen(name, "w");
        if (out == NULL) {
            perror(name);
            break;
        }
        printf("run %d:", nruns);
        for (i = 0; i < n; i++) {
            fprintf(out, "%d\n", buf[i]);
            printf(" %d", buf[i]);
        }
        printf("\n");
        fclose(out);
        nruns++;
    }
    fclose(in);

    /* Phase 2: open every run at once (an array of FILE pointers - look
       at it in the variables panel) and repeatedly take the smallest
       front number. Memory needed: one number per run. */
    for (i = 0; i < nruns; i++) {
        sprintf(name, "/tmp/run%d.txt", i);
        run[i] = fopen(name, "r");
        alive[i] = run[i] != NULL && fscanf(run[i], "%d", &head[i]) == 1;
    }
    out = fopen("/tmp/sorted.txt", "w");
    if (out == NULL) {
        perror("/tmp/sorted.txt");
        return 1;
    }
    for (;;) {
        best = -1;
        for (i = 0; i < nruns; i++)
            if (alive[i] && (best < 0 || head[i] < head[best]))
                best = i;
        if (best < 0)
            break;              /* every run is empty */
        fprintf(out, "%d\n", head[best]);
        total++;
        alive[best] = fscanf(run[best], "%d", &head[best]) == 1;
    }
    fclose(out);
    for (i = 0; i < nruns; i++) {
        if (run[i] != NULL)
            fclose(run[i]);
        sprintf(name, "/tmp/run%d.txt", i);
        remove(name);           /* the runs were only scaffolding */
    }

    in = fopen("/tmp/sorted.txt", "r");
    if (in == NULL) {
        perror("/tmp/sorted.txt");
        return 1;
    }
    printf("sorted %d:", total);
    while (fscanf(in, "%d", &x) == 1)
        printf(" %d", x);
    printf("\n");
    fclose(in);
    return 0;
}

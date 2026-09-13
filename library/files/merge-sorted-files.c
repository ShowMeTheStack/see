/*
 * title: Merging two sorted files
 * level: 3
 * about: Merges two files of sorted numbers into a third sorted file, reading each input only once with one number of look-ahead.
 */
#include <stdio.h>

static int write_numbers(const char *path, const int *v, int n)
{
    FILE *fp = fopen(path, "w");
    int i;

    if (fp == NULL) {
        perror(path);
        return 0;
    }
    for (i = 0; i < n; i++)
        fprintf(fp, "%d\n", v[i]);
    fclose(fp);
    return 1;
}

int main(void)
{
    static const int odd[] = { 1, 3, 7, 9, 15, 21 };
    static const int mix[] = { 2, 3, 4, 10, 11 };
    FILE *a, *b, *out;
    int x, y;
    int have_x, have_y;
    int count = 0;

    if (!write_numbers("/tmp/a.txt", odd, 6) || !write_numbers("/tmp/b.txt", mix, 5))
        return 1;

    a = fopen("/tmp/a.txt", "r");
    b = fopen("/tmp/b.txt", "r");
    out = fopen("/tmp/merged.txt", "w");
    if (a == NULL || b == NULL || out == NULL) {
        perror("open");
        if (a) fclose(a);
        if (b) fclose(b);
        if (out) fclose(out);
        return 1;
    }

    /* Hold the next number from each file in x and y. have_x and have_y
       say whether that number is real or the file has run dry. This is
       the same merge step as in merge sort, only the arrays are files and
       could be far bigger than memory. */
    have_x = fscanf(a, "%d", &x) == 1;
    have_y = fscanf(b, "%d", &y) == 1;
    while (have_x || have_y) {
        /* Take x when y is gone, or when x is not bigger. "<=" keeps
           the merge stable: on a tie, file a goes first. */
        if (have_x && (!have_y || x <= y)) {
            fprintf(out, "%d\n", x);
            printf("a gives %2d\n", x);
            have_x = fscanf(a, "%d", &x) == 1;
        } else {
            fprintf(out, "%d\n", y);
            printf("b gives %2d\n", y);
            have_y = fscanf(b, "%d", &y) == 1;
        }
        count++;
    }
    fclose(a);
    fclose(b);
    fclose(out);

    out = fopen("/tmp/merged.txt", "r");
    if (out == NULL) {
        perror("/tmp/merged.txt");
        return 1;
    }
    printf("merged %d numbers:", count);
    while (fscanf(out, "%d", &x) == 1)
        printf(" %d", x);
    printf("\n");
    fclose(out);
    return 0;
}

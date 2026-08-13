/*
 * title: Arrays passed to functions
 * level: 2
 * about: Shows that an array argument arrives as a pointer to its first element, so the function can change it but cannot know its size.
 */
#include <stdio.h>

/* "int a[]" in a parameter list means exactly "int *a". The array is
   not copied; only its starting address is passed. That is why the
   length must travel as a separate argument. */
int sum(int a[], int n)
{
    int i, s = 0;

    /* Inside here sizeof a is the size of a pointer (4), not of the
       array, so it is useless for counting elements. */
    printf("  inside sum: sizeof a = %d\n", (int)sizeof a);
    for (i = 0; i < n; i++)
        s += a[i];
    return s;
}

/* Because a points into the caller's array, writes land there too. */
void scale(int *a, int n, int factor)
{
    int i;

    for (i = 0; i < n; i++)
        a[i] *= factor;    /* watch main's array change, cell by cell */
}

void print_all(const char *label, const int *a, int n)
{
    int i;

    printf("%-8s", label);
    for (i = 0; i < n; i++)
        printf(" %3d", a[i]);
    printf("\n");
}

int main(void)
{
    int v[6];
    int i;

    for (i = 0; i < 6; i++)
        v[i] = i + 1;

    printf("in main: sizeof v = %d, so v has %d elements\n",
           (int)sizeof v, (int)(sizeof v / sizeof v[0]));

    print_all("start", v, 6);
    printf("sum = %d\n", sum(v, 6));

    /* In the memory picture, scale's parameter a is an arrow pointing
       at v[0] in main's frame. */
    scale(v, 6, 10);
    print_all("scaled", v, 6);

    /* Passing v + 3 hands over the address of v[3]: the function sees
       a three-element array that is really the tail of v. */
    scale(v + 3, 3, -1);
    print_all("tail neg", v, 6);
    printf("sum of last three = %d\n", sum(v + 3, 3));
    return 0;
}

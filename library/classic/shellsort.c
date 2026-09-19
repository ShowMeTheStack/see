/*
 * title: Shell sort
 * level: 2
 * about: Sorts an array with Shell's method, comparing far-apart elements first and halving the gap, and prints the array after each gap.
 */
#include <stdio.h>

void show(const char *label, const int v[], int n)
{
    int i;

    printf("%-9s", label);
    for (i = 0; i < n; i++)
        printf("%3d", v[i]);
    printf("\n");
}

/* Plain insertion sort only moves elements one place at a time, so an
   element far from home takes many steps. Shell sort first sorts
   elements that are gap apart, so big moves happen early, then halves
   the gap. The final pass with gap 1 is an ordinary insertion sort,
   but by then the array is almost sorted and it has little to do. */
void shellsort(int v[], int n)
{
    int gap, i, j, temp;
    char label[16];

    for (gap = n / 2; gap > 0; gap /= 2) {
        for (i = gap; i < n; i++)
            for (j = i - gap; j >= 0 && v[j] > v[j + gap]; j -= gap) {
                temp = v[j];
                v[j] = v[j + gap];
                v[j + gap] = temp;
            }
        sprintf(label, "gap %d:", gap);
        show(label, v, n);
    }
}

int main(void)
{
    int v[16];
    int i;

    /* Some scrambled numbers: multiply by 7 modulo 17 visits 1..16 in a
       jumbled order. */
    for (i = 0; i < 16; i++)
        v[i] = (i + 1) * 7 % 17;
    show("start:", v, 16);
    shellsort(v, 16);
    return 0;
}

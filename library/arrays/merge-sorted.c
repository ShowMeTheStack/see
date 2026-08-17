/*
 * title: Merging two sorted lists
 * level: 2
 * about: Merges two sorted arrays of race times into one sorted array by always taking the smaller front item.
 */
#include <stdio.h>

int main(void)
{
    int heat1[5] = { 52, 55, 61, 64, 70 };
    int heat2[6] = { 50, 56, 57, 63, 71, 80 };
    int all[11];        /* exactly 5 + 6 slots */
    int i = 0, j = 0, k = 0;

    /* Each array is already in order, so the smallest remaining time is
       always at the front of one of them. Compare the two fronts, take the
       smaller, advance that index. Watch i, j and k in the locals panel. */
    while (i < 5 && j < 6) {
        if (heat1[i] <= heat2[j])   /* <= keeps equal times in heat order */
            all[k++] = heat1[i++];
        else
            all[k++] = heat2[j++];
    }
    /* One list is used up; copy whatever remains of the other. Only one of
       these loops will do anything. */
    while (i < 5)
        all[k++] = heat1[i++];
    while (j < 6)
        all[k++] = heat2[j++];

    for (k = 0; k < 11; k++)
        printf("%2d. %d s\n", k + 1, all[k]);
    return 0;
}

/*
 * title: Sorting names by swapping pointers
 * level: 2
 * about: Sorts an array of string pointers alphabetically by exchanging the pointers, never copying a single character.
 */
#include <stdio.h>
#include <string.h>

#define N 7

int main(void)
{
    /*
     * Each element is a char * aimed at a string literal. The literals sit
     * in their own read-only area; the array holds only seven addresses.
     */
    const char *names[N];
    const char *t;
    int i, j, swaps = 0;

    names[0] = "Pascal";  names[1] = "Ritchie"; names[2] = "Hopper";
    names[3] = "Lovelace"; names[4] = "Knuth";  names[5] = "Dijkstra";
    names[6] = "Backus";

    /*
     * Bubble sort. Swapping two 4 byte pointers is cheap, however long
     * the names are. Watch the arrows from names[] reorder while the
     * literals never move.
     */
    for (i = 0; i < N - 1; i++) {
        for (j = 0; j < N - 1 - i; j++) {
            if (strcmp(names[j], names[j + 1]) > 0) {
                t = names[j];
                names[j] = names[j + 1];
                names[j + 1] = t;
                swaps++;
            }
        }
    }

    for (i = 0; i < N; i++)
        printf("%d. %s\n", i + 1, names[i]);
    printf("%d pointer swaps, 0 characters copied\n", swaps);

    /* names[i][0] is the first letter: index the array, then index the string. */
    printf("initials:");
    for (i = 0; i < N; i++)
        printf(" %c", names[i][0]);
    printf("\n");
    return 0;
}

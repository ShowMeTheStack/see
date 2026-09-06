/*
 * title: Sorting algorithms in a table
 * level: 3
 * about: Puts four sorting functions and their names into an array of structs and runs each on the same shuffled cards, timing them in comparisons through a shared callback.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define N 52

typedef int (*cmp_fn)(int, int);
typedef void (*sort_fn)(int a[], int n, cmp_fn cmp);

static long comparisons;

/* Cards are numbered 0..51: suit = c / 13, rank = c % 13. */
int by_rank_then_suit(int x, int y)
{
    comparisons++;
    if (x % 13 != y % 13)
        return x % 13 - y % 13;
    return x / 13 - y / 13;
}

int by_suit_then_rank(int x, int y)
{
    comparisons++;
    return x - y;
}

/* Every sort takes the comparison as a parameter: two levels of callbacks. */
void bubble(int a[], int n, cmp_fn cmp)
{
    int i, j, t;
    for (i = 0; i < n - 1; i++)
        for (j = 0; j < n - 1 - i; j++)
            if (cmp(a[j], a[j + 1]) > 0) { t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; }
}

void insertion(int a[], int n, cmp_fn cmp)
{
    int i, j, key;
    for (i = 1; i < n; i++) {
        key = a[i];
        for (j = i - 1; j >= 0 && cmp(a[j], key) > 0; j--)
            a[j + 1] = a[j];
        a[j + 1] = key;
    }
}

void selection(int a[], int n, cmp_fn cmp)
{
    int i, j, m, t;
    for (i = 0; i < n - 1; i++) {
        m = i;
        for (j = i + 1; j < n; j++)
            if (cmp(a[j], a[m]) < 0) m = j;
        t = a[i]; a[i] = a[m]; a[m] = t;
    }
}

void shell(int a[], int n, cmp_fn cmp)
{
    int gap, i, j, key;
    for (gap = n / 2; gap > 0; gap /= 2)
        for (i = gap; i < n; i++) {
            key = a[i];
            for (j = i - gap; j >= 0 && cmp(a[j], key) > 0; j -= gap)
                a[j + gap] = a[j];
            a[j + gap] = key;
        }
}

struct algorithm {
    const char *name;
    sort_fn sort;
};

const struct algorithm algorithms[] = {
    { "bubble", bubble }, { "insertion", insertion },
    { "selection", selection }, { "shell", shell }
};

void print_cards(const int a[], int n)
{
    const char *ranks = "A23456789TJQK";
    const char *suits = "CDHS";
    int i;
    for (i = 0; i < n; i++)
        printf("%c%c%c", ranks[a[i] % 13], suits[a[i] / 13], i % 26 == 25 ? '\n' : ' ');
}

int main(void)
{
    int deck[N], work[N];
    int i, j, t, k;

    /* A Fisher-Yates shuffle with a fixed seed, so the deal is repeatable. */
    for (i = 0; i < N; i++)
        deck[i] = i;
    srand(52);
    for (i = N - 1; i > 0; i--) {
        j = rand() % (i + 1);
        t = deck[i]; deck[i] = deck[j]; deck[j] = t;
    }
    printf("shuffled:\n");
    print_cards(deck, N);

    for (k = 0; k < (int)(sizeof algorithms / sizeof algorithms[0]); k++) {
        memcpy(work, deck, sizeof deck);
        comparisons = 0;
        algorithms[k].sort(work, N, by_rank_then_suit);
        printf("%-10s %5ld comparisons\n", algorithms[k].name, comparisons);
    }
    printf("sorted by rank:\n");
    print_cards(work, N);

    /* Same algorithm, different callback, different order. */
    shell(work, N, by_suit_then_rank);
    printf("sorted by suit:\n");
    print_cards(work, N);
    return 0;
}

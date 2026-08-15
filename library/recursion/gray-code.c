/*
 * title: Binary strings and Gray code
 * level: 2
 * about: Generates all binary strings of a given length recursively, then builds the reflected Gray code where neighbours differ in one bit.
 */
#include <stdio.h>

#define N 4

char bits[N + 1];

/* Fill position i with '0', recurse, then with '1', recurse. At the
   bottom (i == N) the whole string is decided, so print it. This is
   counting in binary, done by recursion. */
void all_strings(int i)
{
    if (i == N) {
        printf("%s ", bits);
        return;
    }
    bits[i] = '0';
    all_strings(i + 1);
    bits[i] = '1';
    all_strings(i + 1);
}

/* Reflected Gray code: the code for n bits is the code for n - 1 bits
   with a 0 in front, followed by the same list read backwards with a 1
   in front. "reversed" tells a call which way round to go. */
int previous = -1;

void gray(int i, int reversed)
{
    int value, k, diff;

    if (i == N) {
        value = 0;
        for (k = 0; k < N; k++)
            value = value * 2 + (bits[k] - '0');
        diff = previous < 0 ? 0 : value ^ previous;
        printf("  %s  = %2d", bits, value);
        if (previous >= 0)
            printf("   changed bit worth %d", diff);
        printf("\n");
        previous = value;
        return;
    }
    bits[i] = reversed ? '1' : '0';
    gray(i + 1, 0);
    bits[i] = reversed ? '0' : '1';
    gray(i + 1, 1);
}

int main(void)
{
    bits[N] = '\0';

    printf("all %d strings of %d bits:\n", 1 << N, N);
    all_strings(0);
    printf("\n\nGray code order:\n");
    gray(0, 0);
    return 0;
}

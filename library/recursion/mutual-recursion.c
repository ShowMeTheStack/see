/*
 * title: Two functions that call each other
 * level: 2
 * about: Decides even and odd by mutual recursion, then generates Hofstadter's Female and Male sequences, each defined using the other.
 */
#include <stdio.h>

/* Mutual recursion: is_even calls is_odd, which calls is_even. Neither
   could be compiled without knowing the other exists, so a prototype
   comes first. In See, the call stack alternates names as it grows:
   is_even, is_odd, is_even, ... */
int is_odd(unsigned int n);

int is_even(unsigned int n)
{
    if (n == 0)
        return 1;
    return is_odd(n - 1);
}

int is_odd(unsigned int n)
{
    if (n == 0)
        return 0;
    return is_even(n - 1);
}

/* Hofstadter's sequences from "Godel, Escher, Bach":
     F(0) = 1, M(0) = 0
     F(n) = n - M(F(n - 1))
     M(n) = n - F(M(n - 1))
   They are almost equal, and differ at a strange set of places. */
int M(int n);

int F(int n)
{
    return n == 0 ? 1 : n - M(F(n - 1));
}

int M(int n)
{
    return n == 0 ? 0 : n - F(M(n - 1));
}

int main(void)
{
    unsigned int k;
    int n;

    for (k = 0; k <= 7; k++)
        printf("%u is %s\n", k, is_even(k) ? "even" : "odd");
    printf("17 is %s (17 alternating calls deep)\n", is_odd(17) ? "odd" : "even");

    printf("\n n:");
    for (n = 0; n < 20; n++)
        printf("%3d", n);
    printf("\n F:");
    for (n = 0; n < 20; n++)
        printf("%3d", F(n));
    printf("\n M:");
    for (n = 0; n < 20; n++)
        printf("%3d", M(n));
    printf("\n F and M differ at n =");
    for (n = 0; n < 20; n++)
        if (F(n) != M(n))
            printf(" %d", n);
    printf("\n");
    return 0;
}

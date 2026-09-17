/*
 * title: Perfect, abundant and deficient numbers
 * level: 2
 * about: Adds up the proper divisors of numbers up to 10000, lists the perfect ones and counts the other two kinds.
 */
#include <stdio.h>

/* Sum of the divisors of n that are smaller than n.
   Divisors come in pairs: if d divides n, so does n / d. Walking d up to
   the square root and adding both halves of each pair is far quicker
   than trying every number below n. */
long divisor_sum(long n)
{
    long sum = 1;          /* 1 divides everything */
    long d;

    if (n == 1)
        return 0;
    for (d = 2; d * d <= n; d++) {
        if (n % d == 0) {
            sum += d;
            if (d != n / d)    /* 6 * 6 = 36: count 6 only once */
                sum += n / d;
        }
    }
    return sum;
}

int main(void)
{
    long n, s;
    int abundant = 0, deficient = 0, perfect = 0;

    for (n = 1; n <= 10000; n++) {
        s = divisor_sum(n);
        if (s == n) {
            perfect++;
            printf("%ld is perfect: its divisors add up to itself\n", n);
        } else if (s > n) {
            abundant++;
        } else {
            deficient++;
        }
    }
    printf("up to 10000: %d perfect, %d abundant, %d deficient\n",
           perfect, abundant, deficient);

    /* Euclid knew that when 2^p - 1 is prime, 2^(p-1) * (2^p - 1) is
       perfect. Check it against what the loop found. */
    printf("Euclid: 2*3=%d, 4*7=%d, 16*31=%d, 64*127=%d\n",
           2 * 3, 4 * 7, 16 * 31, 64 * 127);
    return 0;
}

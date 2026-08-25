/*
 * title: The static buffer trap
 * level: 3
 * about: A function returns its answer in a static buffer, which is safe to return but is overwritten by the next call, so two results printed together come out the same.
 */
#include <stdio.h>
#include <string.h>

/*
 * Turns 1..3999 into Roman numerals. The buffer is static, so it outlives
 * the call and returning its address is legal (a plain local array would be
 * gone the moment we return). The catch: there is only one buffer.
 */
static const char *roman(int n)
{
    static char buf[20];
    static const int value[] = { 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1 };
    static const char *digit[] = { "M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I" };
    int i;

    buf[0] = '\0';
    for (i = 0; i < 13; i++)
        while (n >= value[i]) {
            strcat(buf, digit[i]);
            n -= value[i];
        }
    return buf;
}

int main(void)
{
    const char *a, *b;
    char saved[20];

    /* One at a time, everything looks fine. */
    printf("1989 = %s\n", roman(1989));
    printf("2024 = %s\n", roman(2024));

    /*
     * Keep two results and print them together: both pointers hold the same
     * address, so both show whatever the last call wrote. In See, a and b
     * have arrows to the very same box in the globals area.
     */
    a = roman(14);
    b = roman(99);
    printf("a = %s, b = %s   (a == b: %s)\n", a, b, a == b ? "yes" : "no");

    /* The cure: copy the result somewhere you own before calling again. */
    strcpy(saved, roman(14));
    b = roman(99);
    printf("saved = %s, b = %s\n", saved, b);

    /*
     * The same trap hides in real library functions: asctime, ctime,
     * localtime and strtok all keep their result in static storage.
     */
    return 0;
}

/*
 * title: Const parameters are a promise
 * level: 2
 * about: Writes array and string helpers whose const parameters tell the caller which arguments will only be read.
 */
#include <stdio.h>
#include <ctype.h>

/*
 * const int *a says "I will read your array but not change it". The
 * caller can pass anything, const or not, and knows it is safe.
 */
long sum(const int *a, int n)
{
    long s = 0;
    int i;
    for (i = 0; i < n; i++)
        s += a[i];
    /* a[0] = 0;   error: assignment of read-only location 'a[0]' */
    return s;
}

/* Counts vowels. The const in the type is the documentation. */
int vowels(const char *s)
{
    int n = 0;
    for (; *s != '\0'; s++)               /* s itself may move: only the chars are const */
        if (tolower((unsigned char)*s) == 'a' || tolower((unsigned char)*s) == 'e' ||
            tolower((unsigned char)*s) == 'i' || tolower((unsigned char)*s) == 'o' ||
            tolower((unsigned char)*s) == 'u')
            n++;
    return n;
}

/* No const here: this one does change the string, and the signature admits it. */
void shout(char *s)
{
    for (; *s != '\0'; s++)
        *s = (char)toupper((unsigned char)*s);
}

/*
 * const on a plain value parameter, like "const int n", promises nothing
 * to the caller (the function gets a copy anyway). It only stops the
 * function body from changing its own copy.
 */
int triple(const int n)
{
    /* n = n * 3;   error: assignment of read-only parameter 'n' */
    return n * 3;
}

int main(void)
{
    int data[5];
    const int fixed[3] = { 7, 8, 9 };
    char name[] = "Dennis Ritchie";

    data[0] = 4; data[1] = 1; data[2] = 5; data[3] = 9; data[4] = 2;

    printf("sum of data: %ld\n", sum(data, 5));     /* int * converts to const int * quietly */
    printf("sum of fixed: %ld\n", sum(fixed, 3));   /* and a const array is fine too */
    printf("vowels in \"%s\": %d\n", name, vowels(name));
    printf("vowels in a literal: %d\n", vowels("Brian Kernighan"));

    shout(name);
    printf("shouted: %s\n", name);

    /*
     *     shout(fixed_text);   where fixed_text is a const char array
     * would warn: passing argument discards 'const' qualifier from
     * pointer target type. The const says "do not let anyone write here".
     */
    printf("triple(14) = %d\n", triple(14));
    return 0;
}

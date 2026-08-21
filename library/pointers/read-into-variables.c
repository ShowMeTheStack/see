/*
 * title: scanf needs addresses
 * level: 1
 * about: Reads a name, an age and a height with scanf, passing the address of each variable so scanf can fill it.
 * input: Mira 14 1.62
 */
#include <stdio.h>

int main(void)
{
    char name[20];
    int age = 0;
    double height = 0.0;
    int *where;
    int got;

    /*
     * scanf cannot change age if it gets a copy of age, just like any
     * other function. So we pass &age and &height. name is an array, and
     * an array name already turns into the address of its first char,
     * so it needs no &. %19s stops at 19 chars to leave room for '\0'.
     */
    got = scanf("%19s %d %lf", name, &age, &height);
    if (got != 3) {
        printf("expected a name, an age and a height\n");
        return 0;
    }

    printf("%s is %d and %.2f m tall\n", name, age, height);

    /*
     * A pointer that already holds an address is passed as it is.
     * Here where points at age, so scanf-style code would use where, not &where.
     */
    where = &age;
    *where += 1;
    printf("next year %s will be %d\n", name, age);
    return 0;
}

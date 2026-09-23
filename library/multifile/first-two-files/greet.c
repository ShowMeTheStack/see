/* greet.c - keeps the promise made in greet.h. */
#include <stdio.h>
#include "greet.h"

static int given = 0;   /* private to this file */

void greet(const char *name, int times)
{
    int i;

    for (i = 0; i < times; i++) {
        printf("Hello, %s!\n", name);
        given++;
    }
}

int greetings_given(void)
{
    return given;
}

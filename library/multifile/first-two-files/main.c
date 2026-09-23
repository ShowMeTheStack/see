/*
 * title: Your first program in two files
 * level: 1
 * about: Calls a greeting function whose body lives in a second file, joined to main.c by a shared header.
 */

/* This program is a folder: main.c, greet.c and greet.h.
 *
 * When you press Run, See compiles main.c and greet.c separately. While
 * compiling main.c it has not seen greet's body, only the declaration in
 * greet.h, and that is enough to compile the call. Then the linker joins
 * the two compiled files, connecting the call here to the body in greet.c.
 * That is the whole idea of a program in several files.
 *
 * Press F11 on the greet line: the editor switches to greet.c, and the
 * call stack shows greet on top of main. */
#include <stdio.h>
#include "greet.h"

int main(void)
{
    greet("world", 1);
    greet("See", 2);
    printf("%d greetings in all\n", greetings_given());
    return 0;
}

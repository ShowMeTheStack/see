/*
 * title: String copy one byte short
 * level: 2
 * about: Duplicates strings on the heap with malloc(strlen(s)), forgetting the byte for the '\0'.
 * expect: fault
 */

/*
 * THE PUZZLE
 * copy_string() asks malloc for exactly strlen(s) bytes, then copies s
 * into them with strcpy. strlen counts the letters. What does strcpy
 * copy?
 *
 * HOW TO HUNT IT WITH SEE
 * Run it. The crash is inside strcpy, one byte past the end of a heap
 * block. Step back with F8 to the malloc line and look at the new block
 * on the heap: hover it and read its size. "apple" has five letters;
 * the block holds five bytes. Now count what strcpy wants to write.
 * On many real systems this bug goes unnoticed for years because
 * malloc rounds sizes up and the spare byte happens to be there; See
 * gives each block exactly the bytes you asked for.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static char *copy_string(const char *s)
{
    char *p = malloc(strlen(s));

    if (p == NULL)
        return NULL;
    strcpy(p, s);
    return p;
}

int main(void)
{
    const char *fruit[3];
    char *copy[3];
    int i;

    fruit[0] = "apple";
    fruit[1] = "banana";
    fruit[2] = "cherry";

    for (i = 0; i < 3; i++)
        copy[i] = copy_string(fruit[i]);

    for (i = 0; i < 3; i++) {
        printf("%s\n", copy[i]);
        free(copy[i]);
    }
    return 0;
}

/*
 * THE FIX
 *     char *p = malloc(strlen(s) + 1);
 * A string of n letters needs n + 1 bytes. Say "plus one for the
 * terminator" out loud every time you size a string buffer; it is the
 * single most common off-by-one in C.
 */

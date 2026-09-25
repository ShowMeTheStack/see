/*
 * title: Copying a struct that holds a pointer
 * level: 3
 * about: Copies a contact struct with = to keep a backup, frees the original's name, and finds the backup's name gone too.
 * expect: fault
 */

/*
 * THE PUZZLE
 * backup = current copies every member of the struct. One member is a
 * pointer. Copying a pointer copies the address, not the characters at
 * that address. After the copy, how many names exist on the heap?
 *
 * HOW TO HUNT IT WITH SEE
 * Step over the line backup = current (F10) and look at the memory
 * picture: two structs on the stack, and two arrows meeting at the same
 * heap block. That is a shallow copy. Step on: rename_contact() gives
 * current a new block and frees the old one. backup's arrow now leads to freed
 * memory, and when printf follows it See stops with use after free.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct contact {
    char *name;
    int age;
};

static char *dup(const char *s)
{
    char *p = malloc(strlen(s) + 1);

    if (p == NULL)
        exit(1);
    strcpy(p, s);
    return p;
}

static void rename_contact(struct contact *c, const char *name)
{
    char *fresh = dup(name);

    free(c->name);
    c->name = fresh;
}

int main(void)
{
    struct contact current, backup;

    current.name = dup("Margaret");
    current.age = 47;

    backup = current;
    rename_contact(&current, "Peggy");

    printf("now:    %s, %d\n", current.name, current.age);
    printf("before: %s, %d\n", backup.name, backup.age);

    free(current.name);
    return 0;
}

/*
 * THE FIX
 * Make a deep copy: copy the struct, then give the copy its own name.
 *
 *     backup = current;
 *     backup.name = dup(current.name);
 *     ...
 *     free(backup.name);
 *
 * Any struct that owns heap memory needs a copy function written by
 * hand, because = only ever copies the bytes of the struct itself.
 * Try also swapping the two lines in rename_contact so that it frees
 * first and allocates second: malloc then hands back the very block
 * just freed, backup.name happens to point at "Peggy", and the bug
 * hides completely. Hidden is not fixed.
 */

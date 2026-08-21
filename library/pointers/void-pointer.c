/*
 * title: void pointers and a type tag
 * level: 2
 * about: Stores pointers to an int, a double and a string in one table of void pointers and prints each by casting it back.
 */
#include <stdio.h>

enum kind { K_INT, K_DOUBLE, K_TEXT };

/*
 * A void * can hold the address of any object, but it has forgotten the
 * type, so it cannot be dereferenced or stepped with ++. Whoever reads it
 * must know, here from a tag, what type to cast it back to.
 */
struct slot {
    enum kind kind;
    void *data;
};

void print_slot(const struct slot *s)
{
    switch (s->kind) {
    case K_INT:
        printf("int    %d\n", *(int *)s->data);
        break;
    case K_DOUBLE:
        printf("double %.3f\n", *(double *)s->data);
        break;
    case K_TEXT:
        printf("text   \"%s\"\n", (char *)s->data);
        break;
    }
}

int main(void)
{
    int count = 42;
    double pi = 3.14159;
    char word[] = "void";
    struct slot table[3];
    int i;

    /*
     * Any object pointer converts to void * and back without a cast and
     * without losing anything. In See all three arrows start from the
     * same kind of field but land on objects of different sizes.
     */
    table[0].kind = K_INT;    table[0].data = &count;
    table[1].kind = K_DOUBLE; table[1].data = &pi;
    table[2].kind = K_TEXT;   table[2].data = word;

    for (i = 0; i < 3; i++)
        print_slot(&table[i]);

    /* Changing the int through the table, after casting back to int *. */
    *(int *)table[0].data += 1;
    printf("count is now %d\n", count);

    /*
     * Casting to the wrong type compiles but reads the bytes wrongly:
     * *(double *)&count would read 8 bytes from a 4 byte int. The tag is
     * what keeps this honest.
     */
    return 0;
}

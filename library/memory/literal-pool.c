/*
 * title: Where string literals live
 * level: 2
 * about: Prints the addresses of several string literals, two arrays and a pointer to show which strings are shared read-only data and which are private copies.
 */
#include <stdio.h>
#include <string.h>

static const char *greeting(void)
{
    /* The literal outlives the call: it is not on the stack. */
    return "good morning";
}

int main(void)
{
    const char *a = "apple";
    const char *b = "apple";
    char c[] = "apple";
    char d[] = "apple";
    const char *g = greeting();

    /*
     * a and b may point at one shared copy of "apple" (compilers are allowed
     * to merge identical literals). c and d are separate arrays in main's
     * frame; each got its own copy when it was initialised.
     */
    printf("a points to %p\n", (void *)a);
    printf("b points to %p  %s\n", (void *)b, a == b ? "(the same literal)" : "(a different copy)");
    printf("c is at     %p\n", (void *)c);
    printf("d is at     %p\n", (void *)d);
    printf("g points to %p  \"%s\"\n", (void *)g, g);

    /* == compares addresses, strcmp compares characters. */
    printf("c == d          : %s\n", c == d ? "true" : "false");
    printf("strcmp(c, d)==0 : %s\n", strcmp(c, d) == 0 ? "true" : "false");

    /*
     * Indexing a literal directly is perfectly legal: it is just an array
     * of char that lives somewhere read-only.
     */
    printf("\"apple\"[1] = '%c', and \"0123456789\"[7] = '%c'\n", "apple"[1], "0123456789"[7]);
    return 0;
}

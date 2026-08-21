/*
 * title: String functions with walking pointers
 * level: 1
 * about: Writes its own strlen, strcpy and strcat by moving char pointers until they reach the terminating zero.
 */
#include <stdio.h>

/* Counts characters by moving p to the '\0' and subtracting where it began. */
unsigned long my_strlen(const char *s)
{
    const char *p = s;
    while (*p != '\0')
        p++;
    return (unsigned long)(p - s);
}

/*
 * Copies src into dst including the final '\0'. The classic one-liner
 * is  while ((*d++ = *s++) != '\0') ;  spelled out here step by step.
 */
char *my_strcpy(char *dst, const char *src)
{
    char *d = dst;
    while (*src != '\0') {
        *d = *src;
        d++;
        src++;
    }
    *d = '\0';
    return dst;
}

/* Finds the end of dst, then copies src there. */
char *my_strcat(char *dst, const char *src)
{
    char *d = dst;
    while (*d != '\0')
        d++;
    while ((*d++ = *src++) != '\0')
        ;
    return dst;
}

int main(void)
{
    char buf[32];          /* room for 31 characters and the '\0' */

    /*
     * "Hello" sits among the string literals; my_strcpy copies it onto
     * the stack. Step into my_strcpy and watch d move along buf while
     * src moves along the literal.
     */
    my_strcpy(buf, "Hello");
    printf("%s (%lu chars)\n", buf, my_strlen(buf));

    my_strcat(buf, ", pointers");
    printf("%s (%lu chars)\n", buf, my_strlen(buf));

    my_strcat(my_strcat(buf, "!"), "!");
    printf("%s (%lu chars)\n", buf, my_strlen(buf));

    printf("empty string has %lu chars\n", my_strlen(""));
    return 0;
}

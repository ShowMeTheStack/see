/*
 * title: char array or string literal?
 * level: 1
 * about: Puts the same word in a char array and behind a char pointer, then compares their sizes, addresses and what each allows.
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    /* An array initialised from a literal: the compiler counts the letters,
       adds one for the NUL, and copies all 6 bytes into main's stack frame.
       This copy belongs to main and may be changed. */
    char word[] = "hello";

    /* A pointer to a literal: the 6 bytes stay in the program's string
       literal area, which is read-only. msg only holds their address.
       In See, msg's arrow leaves the stack and lands in the literals panel. */
    const char *msg = "hello";

    printf("sizeof word = %lu (5 letters + NUL)\n", (unsigned long)sizeof word);
    printf("sizeof msg  = %lu (just a pointer)\n", (unsigned long)sizeof msg);
    printf("strlen of both = %lu and %lu (the NUL is not counted)\n",
           (unsigned long)strlen(word), (unsigned long)strlen(msg));
    printf("word lives at %p, msg points to %p\n", (void *)word, (void *)msg);

    /* Same letters, different places, so == on the addresses says no.
       Comparing the contents needs strcmp. */
    printf("word == msg?        %s\n", word == msg ? "yes" : "no");
    printf("strcmp(word, msg)?  %d (0 means equal)\n", strcmp(word, msg));

    /* The array is ours to edit. */
    word[0] = 'j';
    printf("word is now \"%s\"\n", word);

    /* The pointer can be moved to point at another literal, but the letters
       it points at must not be written: msg[0] = 'j' would stop the program
       in See with a write to a string literal. The const turns that mistake
       into a compile error instead. */
    msg = "world";
    printf("msg now points at \"%s\"\n", msg);

    /* The array name cannot be pointed elsewhere: word = "x" does not compile.
       An array is a place, not a pointer variable. */
    return 0;
}

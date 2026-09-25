/*
 * title: Password check with ==
 * level: 1
 * about: Reads a password and compares it with the right one using == instead of strcmp.
 * input: swordfish
 * expect: warning
 */

/*
 * THE PUZZLE
 * The user types exactly the right password and is still turned away.
 * The program runs without any error from See, so this is a logic bug.
 * The compiler did warn, though: build it (Ctrl+B) and read Problems.
 *
 *   expected:  Welcome in.
 *   actual:    Wrong password.
 *
 * What does == compare when both sides are strings?
 *
 * HOW TO HUNT IT WITH SEE
 * Stop on the if line and look at the memory picture. typed is an
 * array in main's frame, on the stack. The literal "swordfish" lives
 * in the string literals area. Both hold the same nine letters, but
 * they are two different places. In the comparison each side turns
 * into the address of its first character, so == asks "are these the
 * same place?", and the answer is no. Hover the two addresses in the
 * picture to see them.
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    char typed[32];

    printf("Password: ");
    if (scanf("%31s", typed) != 1)
        return 0;
    printf("\n");

    if (typed == "swordfish")
        printf("Welcome in.\n");
    else
        printf("Wrong password.\n");

    printf("(you typed %lu characters)\n", (unsigned long)strlen(typed));
    return 0;
}

/*
 * THE FIX
 *     if (strcmp(typed, "swordfish") == 0)
 * strcmp compares the characters one by one and returns 0 when the
 * strings are equal. Remember the == 0: strcmp returns 0 for a match,
 * so "if (strcmp(a, b))" means "if they differ".
 */

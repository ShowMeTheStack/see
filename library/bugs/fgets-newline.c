/*
 * title: The command that never matches
 * level: 2
 * about: Reads commands with fgets and compares them with strcmp, forgetting that fgets keeps the newline.
 * input: hello\nhelp\nquit\nhello again\n
 */

/*
 * THE PUZZLE
 * The program should echo lines until it reads "quit". But it echoes
 * "quit" as well and only stops at the end of the input; "help" is not
 * recognised either. This is a logic bug; See reports nothing.
 *
 *   expected:  echo: hello / (help text) / bye
 *   actual:    echo: hello / echo: help / echo: quit / echo: hello again
 *
 * HOW TO HUNT IT WITH SEE
 * Put a breakpoint on the first strcmp line (F9), run with F5, and look
 * at line in the memory picture after "quit" is read: q u i t \n \0.
 * fgets stores the whole line, including the newline that ended it,
 * so "quit\n" is not equal to "quit". Notice too that the echo puts no
 * extra blank lines in the output: the newline was in line all along.
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    char line[64];

    while (fgets(line, sizeof line, stdin) != NULL) {
        if (strcmp(line, "quit") == 0) {
            printf("bye\n");
            break;
        }
        if (strcmp(line, "help") == 0)
            printf("type anything; quit to stop\n");
        else
            printf("echo: %s", line);
    }
    return 0;
}

/*
 * THE FIX
 * Remove the newline straight after reading:
 *
 *     line[strcspn(line, "\n")] = '\0';
 *
 * strcspn returns the length of the leading part with no '\n' in it,
 * which is the position of the newline if there is one, or of the '\0'
 * if there is not, so the line is safe either way. Then change the
 * echo to printf("echo: %s\n", line).
 */

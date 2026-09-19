/*
 * title: Removing comments from C source
 * level: 3
 * about: Strips comments from a piece of C code with a small state machine that knows not to look for them inside strings and character constants.
 */
#include <stdio.h>

/* The C text to clean up. It is held in string literals because a
   comment inside this comment would end it early. Inside a string
   literal the compiler does not look for comments, which is exactly
   the rule our program has to follow too. Adjacent literals are joined
   into one long string by the compiler. */
static const char *source =
    "int x = 1; /* the counter */\n"
    "char *s = \"/* not a comment */\";\n"
    "char c = '\"'; /* a quote */ int y = 2;\n"
    "/* spread\n"
    "   over lines **/ int z = x / y;\n"
    "int w = z /2/ 1;\n";

/* Exercise 1-23. The program is always in exactly one of these states,
   and each character either keeps the state or moves to another.
   Watch state in the locals panel while stepping through the second
   line: it switches to STRING at the double quote, so the slash and
   star inside the string are copied, not taken as a comment opening. */
enum state { CODE, SLASH, COMMENT, STAR, STRING, STRING_ESC, CHAR, CHAR_ESC };

int main(void)
{
    const char *p;
    int c;
    enum state state = CODE;

    printf("before:\n%s\nafter:\n", source);

    for (p = source; (c = *p) != '\0'; p++) {
        switch (state) {
        case CODE:
            if (c == '/')
                state = SLASH;          /* maybe a comment: wait and see */
            else {
                putchar(c);
                if (c == '"')
                    state = STRING;
                else if (c == '\'')
                    state = CHAR;
            }
            break;
        case SLASH:
            if (c == '*') {
                state = COMMENT;
                break;
            }
            putchar('/');               /* it was only a division */
            if (c == '/')
                break;                  /* this slash may start one: stay */
            putchar(c);
            state = (c == '"') ? STRING : (c == '\'') ? CHAR : CODE;
            break;
        case COMMENT:
            if (c == '*')
                state = STAR;
            break;
        case STAR:                      /* inside a comment, just saw a star */
            if (c == '/') {
                state = CODE;
                putchar(' ');           /* a comment counts as a blank */
            } else if (c != '*')
                state = COMMENT;
            break;
        case STRING:
            putchar(c);
            if (c == '\\')
                state = STRING_ESC;     /* the next char cannot end it */
            else if (c == '"')
                state = CODE;
            break;
        case STRING_ESC:
            putchar(c);
            state = STRING;
            break;
        case CHAR:
            putchar(c);
            if (c == '\\')
                state = CHAR_ESC;
            else if (c == '\'')
                state = CODE;
            break;
        case CHAR_ESC:
            putchar(c);
            state = CHAR;
            break;
        }
    }
    if (state == SLASH)
        putchar('/');
    if (state == COMMENT || state == STAR)
        printf("\nwarning: the text ended inside a comment\n");
    return 0;
}

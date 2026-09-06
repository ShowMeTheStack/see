/*
 * title: Number recogniser driven by a table
 * level: 3
 * about: Checks whether each input word is a valid decimal number like -12.5e3 using a state machine whose transitions are functions in a table.
 * input: 42 -7 3.14 +0.5e10 1e 12a .5 - 6.02e-23 1.2.3
 */
#include <stdio.h>
#include <ctype.h>

enum state { START, SIGN, INT, DOT, FRAC, EXP, EXPSIGN, EXPINT, BAD, NSTATES };

const char *state_name[NSTATES] = {
    "start", "sign", "int", "dot", "frac", "exp", "expsign", "expint", "bad"
};

/*
 * One small function per state: given the next character, return the
 * next state. Each function only knows about its own state, so it stays
 * tiny and easy to check against a diagram.
 */
enum state on_start(int c)
{
    if (c == '+' || c == '-') return SIGN;
    if (isdigit(c)) return INT;
    if (c == '.') return DOT;
    return BAD;
}
enum state on_sign(int c)
{
    if (isdigit(c)) return INT;
    if (c == '.') return DOT;
    return BAD;
}
enum state on_int(int c)
{
    if (isdigit(c)) return INT;
    if (c == '.') return FRAC;
    if (c == 'e' || c == 'E') return EXP;
    return BAD;
}
enum state on_dot(int c)        /* a dot with no digits before it needs one after it */
{
    return isdigit(c) ? FRAC : BAD;
}
enum state on_frac(int c)
{
    if (isdigit(c)) return FRAC;
    if (c == 'e' || c == 'E') return EXP;
    return BAD;
}
enum state on_exp(int c)
{
    if (c == '+' || c == '-') return EXPSIGN;
    return isdigit(c) ? EXPINT : BAD;
}
enum state on_expsign(int c) { return isdigit(c) ? EXPINT : BAD; }
enum state on_expint(int c)  { return isdigit(c) ? EXPINT : BAD; }
enum state on_bad(int c)     { (void)c; return BAD; }   /* once bad, always bad */

/*
 * The table: transition[s] is the function for state s. The order must
 * follow enum state exactly. The driver loop below never mentions a
 * single state by name except START and BAD.
 */
enum state (*const transition[NSTATES])(int) = {
    on_start, on_sign, on_int, on_dot, on_frac, on_exp, on_expsign, on_expint, on_bad
};

/* The states where the input may legally end. */
const int accepting[NSTATES] = { 0, 0, 1, 0, 1, 0, 0, 1, 0 };

int main(void)
{
    char word[40];
    enum state s;
    int i;

    while (scanf("%39s", word) == 1) {
        s = START;
        printf("%-10s start", word);
        for (i = 0; word[i] != '\0'; i++) {
            s = transition[s]((unsigned char)word[i]);
            printf(" %s", state_name[s]);
            if (s == BAD)
                break;
        }
        printf("  => %s\n", accepting[s] ? "number" : "not a number");
    }
    return 0;
}

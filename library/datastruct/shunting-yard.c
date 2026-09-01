/*
 * title: Infix to postfix with the shunting-yard algorithm
 * level: 3
 * about: Converts infix arithmetic to reverse Polish notation with an operator stack, then evaluates the postfix form with a number stack, printing both stacks as it goes.
 * input: 3 + 4 * 2 / ( 1 - 5 ) ^ 2 ^ 3\n( 8 - 2 ) * ( 1 + 2 )\n2 ^ 10 - 24\n
 */
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>

#define MAX 64

int prec(char op)
{
    switch (op) {
    case '^': return 3;
    case '*': case '/': return 2;
    case '+': case '-': return 1;
    }
    return 0;
}

/* Edsger Dijkstra's railway-yard picture: numbers go straight to the
   output; operators wait in a siding (the stack) until an operator of lower
   precedence arrives, or a closing bracket. ^ is right-associative, so an
   equal-precedence ^ does not push the waiting one out. */
int to_postfix(char *line, char out[][8])
{
    char ops[MAX];
    int nops = 0, nout = 0;
    char *tok;

    for (tok = strtok(line, " \n"); tok != NULL; tok = strtok(NULL, " \n")) {
        char c = tok[0];
        if (strchr("+-*/^", c) != NULL && tok[1] == '\0') {
            while (nops > 0 && ops[nops - 1] != '(' &&
                   (prec(ops[nops - 1]) > prec(c) ||
                    (prec(ops[nops - 1]) == prec(c) && c != '^'))) {
                out[nout][0] = ops[--nops];
                out[nout++][1] = '\0';
            }
            ops[nops++] = c;
        } else if (c == '(') {
            ops[nops++] = c;
        } else if (c == ')') {
            while (nops > 0 && ops[nops - 1] != '(') {
                out[nout][0] = ops[--nops];
                out[nout++][1] = '\0';
            }
            if (nops > 0)
                nops--;                 /* drop the '(' */
        } else {
            strncpy(out[nout], tok, 7);
            out[nout++][7] = '\0';
        }
    }
    while (nops > 0) {
        out[nout][0] = ops[--nops];
        out[nout++][1] = '\0';
    }
    return nout;
}

/* Postfix needs no brackets and no precedence rules: each operator applies
   to the two numbers on top of the stack. */
double eval_postfix(char tok[][8], int n)
{
    double stack[MAX];
    int top = 0, i, k;
    for (i = 0; i < n; i++) {
        if (prec(tok[i][0]) > 0 && tok[i][1] == '\0') {
            double b = stack[--top];
            double a = stack[--top];
            switch (tok[i][0]) {
            case '+': a = a + b; break;
            case '-': a = a - b; break;
            case '*': a = a * b; break;
            case '/': a = a / b; break;
            case '^': a = pow(a, b); break;
            }
            stack[top++] = a;
        } else {
            stack[top++] = atof(tok[i]);
        }
        printf("     %-3s stack:", tok[i]);
        for (k = 0; k < top; k++)
            printf(" %g", stack[k]);
        printf("\n");
    }
    return stack[0];
}

int main(void)
{
    char line[128];
    char post[MAX][8];
    int n, i;

    while (fgets(line, sizeof line, stdin) != NULL) {
        line[strcspn(line, "\n")] = '\0';
        printf("infix:   %s\n", line);
        n = to_postfix(line, post);
        printf("postfix:");
        for (i = 0; i < n; i++)
            printf(" %s", post[i]);
        printf("\n");
        printf("value:   %g\n\n", eval_postfix(post, n));
    }
    return 0;
}

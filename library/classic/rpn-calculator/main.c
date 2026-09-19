/*
 * title: Reverse Polish calculator in four files
 * level: 3
 * about: The chapter 4 calculator: getop reads tokens with getch and ungetch, numbers go on a stack, operators pop their operands and push the result.
 * input: 1 2 - 4 5 + *\n3 4 2 * 1 5 - / +\n2 0.5 ^\n9 s\n10 3 %\n1 0 /\n6 d + p c\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "calc.h"

/* In reverse Polish notation the operator comes after its operands:
   (1 - 2) * (4 + 5) is written 1 2 - 4 5 + *. No parentheses are needed,
   and a stack does all the work: numbers are pushed, an operator pops
   two numbers and pushes its answer, and a newline prints the top.

   The program is split as in the book: main.c (this file) decides what
   to do with each token, stack.c owns the stack, getop.c cuts the input
   into tokens and getch.c lets getop push back a character it read too
   far. The stack array is static in stack.c: look for it among the
   globals, where only stack.c's functions can reach it.

   Commands beyond + - * /: % remainder, ^ power, s square root,
   d duplicate the top, p print the top without popping, c clear. */
int main(void)
{
    int type;
    double op2;
    char s[MAXOP];

    while ((type = getop(s)) != EOF) {
        switch (type) {
        case NUMBER:
            push(atof(s));
            break;
        case '+':
            push(pop() + pop());   /* order does not matter for + and * */
            break;
        case '*':
            push(pop() * pop());
            break;
        case '-':
            /* For - and / it does. The right operand is on top, so pop
               it first into op2. Writing pop() - pop() would leave the
               order to the compiler. */
            op2 = pop();
            push(pop() - op2);
            break;
        case '/':
            op2 = pop();
            if (op2 != 0.0)
                push(pop() / op2);
            else {
                printf("error: zero divisor\n");
                pop();
                push(0.0);
            }
            break;
        case '%':
            op2 = pop();
            if (op2 != 0.0)
                push(fmod(pop(), op2));
            else
                printf("error: zero divisor\n");
            break;
        case '^':
            op2 = pop();
            push(pow(pop(), op2));
            break;
        case 's':
            push(sqrt(pop()));
            break;
        case 'd':
            op2 = pop();
            push(op2);
            push(op2);
            break;
        case 'p':
            op2 = pop();
            printf("top: %.8g\n", op2);
            push(op2);
            break;
        case 'c':
            clear();
            printf("stack cleared\n");
            break;
        case '\n':
            /* End of a line: the answer is whatever is on top. */
            if (depth() > 0)
                printf("\t%.8g\n", pop());
            break;
        default:
            printf("error: unknown command %s\n", s);
            break;
        }
    }
    return 0;
}

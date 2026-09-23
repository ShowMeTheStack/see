/* eval.c - walks the tree. It knows nothing about text or tokens. */
#include <stdio.h>
#include <math.h>
#include "eval.h"

double eval(const struct node *n, int *ok)
{
    double a, b;

    if (n->op == 'n') {
        return n->value;
    }
    if (n->op == 'u') {
        return -eval(n->left, ok);
    }
    a = eval(n->left, ok);
    b = eval(n->right, ok);
    switch (n->op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '^': return pow(a, b);
    case '/':
        if (b == 0.0) {
            *ok = 0;    /* refuse, rather than let the program fault */
            return 0.0;
        }
        return a / b;
    }
    return 0.0;
}

/* Prints the tree in prefix (Lisp-like) form, which shows exactly how the
 * parser grouped things: (+ 1 (* 2 3)) and not (* (+ 1 2) 3). */
void print_prefix(const struct node *n)
{
    if (n->op == 'n') {
        printf("%g", n->value);
    } else if (n->op == 'u') {
        printf("(neg ");
        print_prefix(n->left);
        printf(")");
    } else {
        printf("(%c ", n->op);
        print_prefix(n->left);
        printf(" ");
        print_prefix(n->right);
        printf(")");
    }
}

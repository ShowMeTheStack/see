/* ast.h - the expression tree that the parser builds and the evaluator
 * walks. Shared by parser.c, eval.c and main.c. */
#ifndef AST_H
#define AST_H

struct node {
    char op;            /* 'n' for a number, 'u' for unary minus, else + - * / ^ */
    double value;       /* for 'n' */
    struct node *left;
    struct node *right; /* NULL for 'n' and 'u' */
};

#endif

/*
 * title: Expression tree with operator functions
 * level: 4
 * about: Parses arithmetic expressions into a tree of heap nodes where each operator node stores a pointer to the function that computes it, then evaluates and prints the tree.
 * input: 2 + 3 * 4\n(2 + 3) * 4\n100 / (7 - 2) - 2 * 3\n2 * (3 + 4) * (5 - 1)
 */
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

/*
 * A node is either a number (op is NULL) or an operator with two
 * children and a pointer to the code that combines them. Evaluation
 * does not need a switch on the operator symbol at all.
 */
struct node {
    double (*op)(double, double);
    char symbol;
    double value;
    struct node *left, *right;
};

double add(double a, double b) { return a + b; }
double sub(double a, double b) { return a - b; }
double mul(double a, double b) { return a * b; }
double dvd(double a, double b) { return a / b; }

static const char *p;          /* the parser's position in the line */

struct node *make(double (*op)(double, double), char symbol, double value,
                  struct node *l, struct node *r)
{
    struct node *n = malloc(sizeof *n);
    if (n == NULL)
        exit(1);
    n->op = op;
    n->symbol = symbol;
    n->value = value;
    n->left = l;
    n->right = r;
    return n;
}

void skip_spaces(void) { while (*p == ' ') p++; }

/*
 * Recursive descent, one function per precedence level:
 *   expr   = term   { (+|-) term }
 *   term   = factor { (*|/) factor }
 *   factor = number | ( expr )
 */
struct node *expr(void);

struct node *factor(void)
{
    struct node *n;
    double v = 0;
    skip_spaces();
    if (*p == '(') {
        p++;
        n = expr();
        skip_spaces();
        if (*p == ')')
            p++;
        return n;
    }
    while (isdigit((unsigned char)*p))
        v = v * 10 + (*p++ - '0');
    return make(NULL, 0, v, NULL, NULL);
}

struct node *term(void)
{
    struct node *n = factor();
    char c;
    for (;;) {
        skip_spaces();
        c = *p;
        if (c != '*' && c != '/')
            return n;
        p++;
        n = make(c == '*' ? mul : dvd, c, 0, n, factor());
    }
}

struct node *expr(void)
{
    struct node *n = term();
    char c;
    for (;;) {
        skip_spaces();
        c = *p;
        if (c != '+' && c != '-')
            return n;
        p++;
        n = make(c == '+' ? add : sub, c, 0, n, term());
    }
}

/* Evaluation: leaves give their value, inner nodes call their op. */
double eval(const struct node *n)
{
    if (n->op == NULL)
        return n->value;
    return n->op(eval(n->left), eval(n->right));
}

/* Print fully bracketed, so the tree's shape is visible. */
void show(const struct node *n)
{
    if (n->op == NULL) {
        printf("%g", n->value);
        return;
    }
    printf("(");
    show(n->left);
    printf(" %c ", n->symbol);
    show(n->right);
    printf(")");
}

void destroy(struct node *n)
{
    if (n == NULL)
        return;
    destroy(n->left);
    destroy(n->right);
    free(n);
}

int main(void)
{
    char line[100];
    struct node *tree;

    /* %99[^\n] reads a whole line; the space before it skips the old newline. */
    while (scanf(" %99[^\n]", line) == 1) {
        p = line;
        tree = expr();
        /* Pause here in See to see the tree of heap blocks hanging off tree. */
        show(tree);
        printf(" = %g\n", eval(tree));
        destroy(tree);
    }
    return 0;
}

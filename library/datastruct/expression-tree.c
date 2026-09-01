/*
 * title: Expression trees: parse, print, evaluate, differentiate
 * level: 4
 * about: Parses formulas in x into binary trees of heap nodes, prints them fully bracketed, evaluates them, builds the derivative as a new tree and frees both.
 * input: 3*x*x + 2*x - 5\n(x + 1) * (x - 1)\nx / (x + 2)\n7 - x - x\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

/* A leaf is a number or the variable x; an inner node is an operator with a
   left and right subtree. The shape of the tree IS the precedence: in
   2 + 3 * x the * node sits below the + node. */
struct expr {
    char op;                 /* '+', '-', '*', '/', 'n' (number) or 'x' */
    double num;
    struct expr *left, *right;
};

int live_nodes = 0;

struct expr *node(char op, double num, struct expr *l, struct expr *r)
{
    struct expr *e = malloc(sizeof *e);
    if (e == NULL)
        exit(1);
    e->op = op;
    e->num = num;
    e->left = l;
    e->right = r;
    live_nodes++;
    return e;
}

struct expr *num(double v) { return node('n', v, NULL, NULL); }

void free_expr(struct expr *e)
{
    if (e == NULL)
        return;
    free_expr(e->left);
    free_expr(e->right);
    free(e);
    live_nodes--;
}

/* --- parsing: one function per precedence level --- */
static const char *p;

static void skip(void) { while (*p == ' ') p++; }
struct expr *parse_sum(void);

struct expr *parse_atom(void)
{
    struct expr *e;
    skip();
    if (*p == '(') {
        p++;
        e = parse_sum();
        skip();
        if (*p == ')')
            p++;
        return e;
    }
    if (*p == 'x') {
        p++;
        return node('x', 0, NULL, NULL);
    }
    if (isdigit((unsigned char)*p)) {
        double v = 0;
        while (isdigit((unsigned char)*p))
            v = v * 10 + (*p++ - '0');
        return num(v);
    }
    p++;                       /* skip something unexpected */
    return num(0);
}

struct expr *parse_product(void)
{
    struct expr *e = parse_atom();
    for (;;) {
        char op;
        skip();
        if (*p != '*' && *p != '/')
            return e;
        op = *p++;
        e = node(op, 0, e, parse_atom());   /* left-associative: grows leftward */
    }
}

struct expr *parse_sum(void)
{
    struct expr *e = parse_product();
    for (;;) {
        char op;
        skip();
        if (*p != '+' && *p != '-')
            return e;
        op = *p++;
        e = node(op, 0, e, parse_product());
    }
}

/* --- using the tree --- */
void print(const struct expr *e)
{
    if (e->op == 'n')
        printf("%g", e->num);
    else if (e->op == 'x')
        printf("x");
    else {
        printf("(");
        print(e->left);
        printf(" %c ", e->op);
        print(e->right);
        printf(")");
    }
}

double eval(const struct expr *e, double x)
{
    switch (e->op) {
    case 'n': return e->num;
    case 'x': return x;
    case '+': return eval(e->left, x) + eval(e->right, x);
    case '-': return eval(e->left, x) - eval(e->right, x);
    case '*': return eval(e->left, x) * eval(e->right, x);
    case '/': return eval(e->left, x) / eval(e->right, x);
    }
    return 0;
}

struct expr *copy(const struct expr *e)
{
    if (e == NULL)
        return NULL;
    return node(e->op, e->num, copy(e->left), copy(e->right));
}

/* Simplifying constructors: they avoid building 0 * x and 1 * x nodes, and
   free the parts they throw away. */
struct expr *mk_add(char op, struct expr *a, struct expr *b)
{
    if (b->op == 'n' && b->num == 0) { free_expr(b); return a; }
    if (op == '+' && a->op == 'n' && a->num == 0) { free_expr(a); return b; }
    return node(op, 0, a, b);
}

struct expr *mk_mul(struct expr *a, struct expr *b)
{
    if ((a->op == 'n' && a->num == 0) || (b->op == 'n' && b->num == 0)) {
        free_expr(a);
        free_expr(b);
        return num(0);
    }
    if (a->op == 'n' && a->num == 1) { free_expr(a); return b; }
    if (b->op == 'n' && b->num == 1) { free_expr(b); return a; }
    return node('*', 0, a, b);
}

/* The derivative rules, each building a fresh tree from copies of the
   original's subtrees. The original is left untouched. */
struct expr *deriv(const struct expr *e)
{
    struct expr *top, *bottom;
    switch (e->op) {
    case 'n': return num(0);
    case 'x': return num(1);
    case '+':
    case '-': return mk_add(e->op, deriv(e->left), deriv(e->right));
    case '*':                  /* (fg)' = f'g + fg' */
        return mk_add('+', mk_mul(deriv(e->left), copy(e->right)),
                           mk_mul(copy(e->left), deriv(e->right)));
    case '/':                  /* (f/g)' = (f'g - fg') / (g*g) */
        top = mk_add('-', mk_mul(deriv(e->left), copy(e->right)),
                          mk_mul(copy(e->left), deriv(e->right)));
        bottom = mk_mul(copy(e->right), copy(e->right));
        return node('/', 0, top, bottom);
    }
    return num(0);
}

int main(void)
{
    char line[128];
    while (fgets(line, sizeof line, stdin) != NULL) {
        struct expr *e, *d;
        p = line;
        e = parse_sum();
        d = deriv(e);
        printf("f(x)  = ");
        print(e);
        printf("\n        f(0) = %g, f(2) = %g\n", eval(e, 0), eval(e, 2));
        printf("f'(x) = ");
        print(d);
        printf("\n        f'(2) = %g\n", eval(d, 2));
        free_expr(e);
        free_expr(d);
        printf("        nodes still allocated: %d\n", live_nodes);
    }
    return 0;
}

/*
 * title: Recursive descent into an expression tree
 * level: 4
 * about: Parses arithmetic with a recursive descent parser that builds a tree on the heap, then prints it in prefix and postfix and evaluates it.
 * input: 1 + 2 * 3\n(1 + 2) * 3\n2 ^ 3 ^ 2\n-4 + 10 / (3 - 1)\n8 - 3 - 2\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>

/* Grammar, one function per rule; each rule calls the rules below it,
   and primary calls back up to expr for brackets. That loop of calls is
   what lets brackets nest to any depth.
     expr    := term   { ('+' | '-') term }
     term    := unary  { ('*' | '/') unary }
     unary   := '-' unary | power
     power   := primary [ '^' unary ]        (right associative)
     primary := number | '(' expr ')'                                   */

struct node {
    char op;                 /* 0 for a number, else + - * / ^ or ~ (negate) */
    double value;
    struct node *left, *right;
};

static const char *p;        /* the next unread character */
static int nodes_alive = 0;

static struct node *make(char op, double v, struct node *l, struct node *r)
{
    struct node *n = (struct node *)malloc(sizeof *n);

    if (n == NULL)
        exit(1);
    n->op = op;
    n->value = v;
    n->left = l;
    n->right = r;
    nodes_alive++;
    return n;
}

static void skip(void)
{
    while (*p == ' ')
        p++;
}

static struct node *expr(void);
static struct node *unary(void);

static struct node *primary(void)
{
    struct node *n;

    skip();
    if (*p == '(') {
        p++;
        n = expr();          /* recursion back to the top rule */
        skip();
        if (*p == ')')
            p++;
        return n;
    }
    return make(0, strtod(p, (char **)&p), NULL, NULL);
}

static struct node *power(void)
{
    struct node *base = primary();

    skip();
    if (*p == '^') {
        p++;
        /* Recursing on the right makes 2^3^2 mean 2^(3^2). */
        return make('^', 0, base, unary());
    }
    return base;
}

static struct node *unary(void)
{
    skip();
    if (*p == '-') {
        p++;
        return make('~', 0, unary(), NULL);
    }
    return power();
}

static struct node *term(void)
{
    struct node *n = unary();
    char op;

    for (skip(); *p == '*' || *p == '/'; skip()) {
        op = *p++;
        n = make(op, 0, n, unary());   /* a loop, so 8/4/2 groups left */
    }
    return n;
}

static struct node *expr(void)
{
    struct node *n = term();
    char op;

    for (skip(); *p == '+' || *p == '-'; skip()) {
        op = *p++;
        n = make(op, 0, n, term());
    }
    return n;
}

/* The tree is recursive, so everything that walks it is too. */
static double eval(const struct node *n)
{
    double a, b, r;
    int i;

    if (n->op == 0)
        return n->value;
    a = eval(n->left);
    if (n->op == '~')
        return -a;
    b = eval(n->right);
    switch (n->op) {
    case '+': return a + b;
    case '-': return a - b;
    case '*': return a * b;
    case '/': return a / b;
    }
    r = 1;                    /* '^' with a small whole exponent */
    for (i = 0; i < (int)b; i++)
        r *= a;
    return r;
}

static void prefix(const struct node *n)
{
    if (n->op == 0) {
        printf(" %g", n->value);
        return;
    }
    printf(" %c", n->op);
    prefix(n->left);
    if (n->right != NULL)
        prefix(n->right);
}

static void postfix(const struct node *n)
{
    if (n->op == 0) {
        printf(" %g", n->value);
        return;
    }
    postfix(n->left);
    if (n->right != NULL)
        postfix(n->right);
    printf(" %c", n->op);
}

/* Children first, then the parent: a parent freed first would take the
   only pointers to its children with it. */
static void destroy(struct node *n)
{
    if (n == NULL)
        return;
    destroy(n->left);
    destroy(n->right);
    free(n);
    nodes_alive--;
}

int main(void)
{
    char line[100];
    struct node *tree;
    int c, len;

    for (;;) {
        len = 0;
        while ((c = getchar()) != EOF && c != '\n')
            if (len < 99)
                line[len++] = (char)c;
        line[len] = '\0';
        if (c == EOF && len == 0)
            break;

        p = line;
        /* Step over this line and the heap view fills with node blocks
           wired into a tree, one block per number or operator. */
        tree = expr();
        printf("%s\n  prefix :", line);
        prefix(tree);
        printf("\n  postfix:");
        postfix(tree);
        printf("\n  value  = %g   (%d nodes)\n", eval(tree), nodes_alive);
        destroy(tree);
    }
    return 0;
}

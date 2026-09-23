/* parser.c - recursive descent. Each grammar rule is one function, and
 * the rules call each other in order of precedence:
 *
 *     expr   := term   { ('+' | '-') term }
 *     term   := power  { ('*' | '/') power }
 *     power  := unary  [ '^' power ]          right-associative
 *     unary  := '-' unary | primary
 *     primary:= number | '(' expr ')'
 *
 * Parse "2*(3+4)" and step in with F11: the call stack grows as the parser
 * dives into the brackets, and each return hands back a heap node. */
#include <stdio.h>
#include <stdlib.h>
#include "lexer.h"
#include "parser.h"

static int failed;

static struct node *expr(struct lexer *lx);

static struct node *make(char op, double value, struct node *l, struct node *r)
{
    struct node *n = malloc(sizeof *n);

    if (n == NULL) {
        failed = 1;
        tree_free(l);
        tree_free(r);
        return NULL;
    }
    n->op = op;
    n->value = value;
    n->left = l;
    n->right = r;
    return n;
}

static void error_at(struct lexer *lx, const char *what)
{
    if (!failed) {
        printf("  error at column %d: %s, found %s\n", lx->current.pos + 1, what, token_name(lx->current.kind));
    }
    failed = 1;
}

static struct node *primary(struct lexer *lx)
{
    struct node *n;

    if (lx->current.kind == TOK_NUM) {
        n = make('n', lx->current.value, NULL, NULL);
        lexer_next(lx);
        return n;
    }
    if (lx->current.kind == TOK_LPAREN) {
        lexer_next(lx);
        n = expr(lx);
        if (lx->current.kind != TOK_RPAREN) {
            error_at(lx, "expected ')'");
            tree_free(n);
            return NULL;
        }
        lexer_next(lx);
        return n;
    }
    error_at(lx, "expected a number or '('");
    return NULL;
}

static struct node *unary(struct lexer *lx)
{
    if (lx->current.kind == TOK_MINUS) {
        lexer_next(lx);
        return make('u', 0.0, unary(lx), NULL);
    }
    return primary(lx);
}

static struct node *power(struct lexer *lx)
{
    struct node *base = unary(lx);

    if (lx->current.kind == TOK_CARET) {
        lexer_next(lx);
        return make('^', 0.0, base, power(lx));     /* recursion gives right-to-left */
    }
    return base;
}

static struct node *term(struct lexer *lx)
{
    struct node *n = power(lx);
    char op;

    while (lx->current.kind == TOK_STAR || lx->current.kind == TOK_SLASH) {
        op = lx->current.kind == TOK_STAR ? '*' : '/';
        lexer_next(lx);
        n = make(op, 0.0, n, power(lx));            /* the loop gives left-to-right */
    }
    return n;
}

static struct node *expr(struct lexer *lx)
{
    struct node *n = term(lx);
    char op;

    while (lx->current.kind == TOK_PLUS || lx->current.kind == TOK_MINUS) {
        op = lx->current.kind == TOK_PLUS ? '+' : '-';
        lexer_next(lx);
        n = make(op, 0.0, n, term(lx));
    }
    return n;
}

struct node *parse_line(const char *text)
{
    struct lexer lx;
    struct node *n;

    failed = 0;
    lexer_start(&lx, text);
    n = expr(&lx);
    if (!failed && lx.current.kind != TOK_END) {
        error_at(&lx, "expected an operator");
    }
    if (failed) {
        tree_free(n);
        return NULL;
    }
    return n;
}

/* Free children before the parent: once the parent is gone, so are the
 * pointers to its children. */
void tree_free(struct node *n)
{
    if (n == NULL) {
        return;
    }
    tree_free(n->left);
    tree_free(n->right);
    free(n);
}

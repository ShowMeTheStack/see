#ifndef EVAL_H
#define EVAL_H

#include "ast.h"

/* Sets *ok to 0 on division by zero. */
double eval(const struct node *n, int *ok);
void print_prefix(const struct node *n);

#endif

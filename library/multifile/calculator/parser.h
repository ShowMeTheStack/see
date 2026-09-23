#ifndef PARSER_H
#define PARSER_H

#include "ast.h"

/* Returns a tree on the heap, or NULL with a message printed. */
struct node *parse_line(const char *text);
void tree_free(struct node *n);

#endif

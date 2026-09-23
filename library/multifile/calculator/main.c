/*
 * title: Calculator in lexer, parser and evaluator files
 * level: 4
 * about: Reads arithmetic expressions line by line, parses each into a tree on the heap and evaluates it.
 * input: 1 + 2 * 3\n(1 + 2) * 3\n2 ^ 3 ^ 2\n-4 + 10 / 4\n8 / (3 - 3)\n2 * (3 + \n7 $ 2\n100 - 99 - 1\n
 */

/* Seven files, three stages:
 *     lexer.c   characters -> tokens
 *     parser.c  tokens     -> tree (struct node, in ast.h)
 *     eval.c    tree       -> number
 * See compiles each .c file separately and then links them into one
 * program. Each stage only includes the headers it needs, which shows the
 * dependencies at a glance: eval.c never includes lexer.h. */
#include <stdio.h>
#include "parser.h"
#include "eval.h"

int main(void)
{
    char line[128];
    struct node *tree;
    double result;
    int ok;

    while (fgets(line, sizeof line, stdin) != NULL) {
        printf("> %s", line);
        tree = parse_line(line);
        if (tree == NULL) {
            continue;
        }
        /* Pause here and look at the heap: one block per node, with
         * arrows from each operator to its two operands. */
        printf("  tree: ");
        print_prefix(tree);
        printf("\n");
        ok = 1;
        result = eval(tree, &ok);
        if (ok) {
            printf("  = %g\n", result);
        } else {
            printf("  error: division by zero\n");
        }
        tree_free(tree);
    }
    return 0;
}

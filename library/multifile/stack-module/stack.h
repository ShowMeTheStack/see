/* stack.h - the public face of the stack module.
 * Other files see only these four functions. The array that holds the
 * numbers lives in stack.c and is static there, so nobody else can reach it. */
#ifndef STACK_H
#define STACK_H

void stack_push(int value);
int stack_pop(void);
int stack_empty(void);
int stack_size(void);

#endif

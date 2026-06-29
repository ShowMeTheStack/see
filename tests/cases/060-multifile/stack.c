#include "stack.h"
static int items[16];
static int top;
int calls;
void push(int v) { items[top++] = v; calls++; }
int pop(void) { calls++; return items[--top]; }
int depth(void) { return top; }

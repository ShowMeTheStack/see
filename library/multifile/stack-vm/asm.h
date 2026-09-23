#ifndef ASM_H
#define ASM_H
#include "vm.h"
/* Reads assembly text from stdin into m->code. Returns 1 on success. */
int assemble(struct vm *m);
void disassemble(const struct vm *m);
#endif

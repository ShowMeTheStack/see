/* vm.h - a little stack machine: its instruction set and its state. */
#ifndef VM_H
#define VM_H

enum opcode {
    OP_PUSH, OP_LOAD, OP_STORE, OP_ADD, OP_SUB, OP_MUL, OP_DIV, OP_MOD,
    OP_LT, OP_EQ, OP_JMP, OP_JZ, OP_DUP, OP_PRINT, OP_HALT, NUM_OPS
};

/* Instructions with an argument (PUSH 5, LOAD 2, JMP 7) take two slots
 * in the code array: the opcode, then the argument. */
#define CODE_MAX 256
#define STACK_MAX 32
#define NREGS 8

struct vm {
    int code[CODE_MAX];
    int ncode;
    int stack[STACK_MAX];
    int sp;                 /* number of values on the stack */
    int reg[NREGS];
    int pc;                 /* index of the next instruction in code[] */
    long steps;
};

const char *op_name(int op);
int op_has_arg(int op);
int vm_run(struct vm *m, long max_steps);

#endif

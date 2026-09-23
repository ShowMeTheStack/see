/* vm.c - fetch, decode, execute, forever, until HALT. This loop is the
 * heart of every interpreter, from BASIC to the JVM. Step through a few
 * rounds in See and watch pc and sp move. */
#include <stdio.h>
#include "vm.h"

static const char *names[NUM_OPS] = {
    "PUSH", "LOAD", "STORE", "ADD", "SUB", "MUL", "DIV", "MOD",
    "LT", "EQ", "JMP", "JZ", "DUP", "PRINT", "HALT"
};

const char *op_name(int op)
{
    return op >= 0 && op < NUM_OPS ? names[op] : NULL;
}

int op_has_arg(int op)
{
    return op == OP_PUSH || op == OP_LOAD || op == OP_STORE || op == OP_JMP || op == OP_JZ;
}

static int fail(struct vm *m, const char *why)
{
    printf("vm error at %d: %s\n", m->pc, why);
    return 0;
}

int vm_run(struct vm *m, long max_steps)
{
    int op, arg = 0, a, b;

    m->pc = 0;
    m->sp = 0;
    m->steps = 0;
    for (a = 0; a < NREGS; a++) {
        m->reg[a] = 0;
    }

    while (m->steps < max_steps) {
        if (m->pc < 0 || m->pc >= m->ncode) {
            return fail(m, "ran off the end of the code");
        }
        op = m->code[m->pc++];                  /* fetch */
        if (op_has_arg(op)) {
            arg = m->code[m->pc++];
        }
        m->steps++;

        /* Binary operators pop b then a, and push a op b. */
        if (op >= OP_ADD && op <= OP_EQ) {
            if (m->sp < 2) return fail(m, "stack underflow");
            b = m->stack[--m->sp];
            a = m->stack[--m->sp];
            switch (op) {
            case OP_ADD: a = a + b; break;
            case OP_SUB: a = a - b; break;
            case OP_MUL: a = a * b; break;
            case OP_DIV: if (b == 0) return fail(m, "division by zero"); a = a / b; break;
            case OP_MOD: if (b == 0) return fail(m, "division by zero"); a = a % b; break;
            case OP_LT:  a = a < b; break;
            case OP_EQ:  a = a == b; break;
            }
            m->stack[m->sp++] = a;
            continue;
        }

        switch (op) {                           /* decode and execute */
        case OP_PUSH:
        case OP_LOAD:
            if (m->sp == STACK_MAX) return fail(m, "stack overflow");
            m->stack[m->sp++] = op == OP_PUSH ? arg : m->reg[arg];
            break;
        case OP_STORE:
            if (m->sp == 0) return fail(m, "stack underflow");
            m->reg[arg] = m->stack[--m->sp];
            break;
        case OP_DUP:
            if (m->sp == 0) return fail(m, "stack underflow");
            if (m->sp == STACK_MAX) return fail(m, "stack overflow");
            m->stack[m->sp] = m->stack[m->sp - 1];
            m->sp++;
            break;
        case OP_JMP:
            m->pc = arg;
            break;
        case OP_JZ:
            if (m->sp == 0) return fail(m, "stack underflow");
            if (m->stack[--m->sp] == 0) {
                m->pc = arg;
            }
            break;
        case OP_PRINT:
            if (m->sp == 0) return fail(m, "stack underflow");
            printf("%d\n", m->stack[--m->sp]);
            break;
        case OP_HALT:
            return 1;
        default:
            return fail(m, "bad opcode");
        }
    }
    return fail(m, "step limit reached");
}

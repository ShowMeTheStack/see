/*
 * title: A bytecode machine with an opcode table
 * level: 4
 * about: Runs small programs for a stack-based virtual machine whose instructions are dispatched through an array of handler functions, computing factorials and a countdown.
 */
#include <stdio.h>

enum opcode { PUSH, ADD, SUB, MUL, DUP, SWAP, JZ, JMP, PRINT, HALT, OVER, DROP, NOPS };

const char *op_name[NOPS] = {
    "PUSH", "ADD", "SUB", "MUL", "DUP", "SWAP", "JZ", "JMP", "PRINT", "HALT", "OVER", "DROP"
};

/* The machine's state, passed to every handler. */
struct vm {
    const int *code;
    int pc;                 /* index of the next instruction */
    long stack[32];
    int sp;                 /* number of items on the stack */
    int running;
    long steps;
};

/*
 * One handler per opcode. Each does its job and moves pc on. Branches
 * just set pc. The interpreter loop never needs to know what any
 * instruction does.
 */
void op_push(struct vm *m)  { m->stack[m->sp++] = m->code[m->pc + 1]; m->pc += 2; }
void op_add(struct vm *m)   { m->sp--; m->stack[m->sp - 1] += m->stack[m->sp]; m->pc++; }
void op_sub(struct vm *m)   { m->sp--; m->stack[m->sp - 1] -= m->stack[m->sp]; m->pc++; }
void op_mul(struct vm *m)   { m->sp--; m->stack[m->sp - 1] *= m->stack[m->sp]; m->pc++; }
void op_dup(struct vm *m)   { m->stack[m->sp] = m->stack[m->sp - 1]; m->sp++; m->pc++; }
void op_over(struct vm *m)  { m->stack[m->sp] = m->stack[m->sp - 2]; m->sp++; m->pc++; }
void op_drop(struct vm *m)  { m->sp--; m->pc++; }
void op_swap(struct vm *m)
{
    long t = m->stack[m->sp - 1];
    m->stack[m->sp - 1] = m->stack[m->sp - 2];
    m->stack[m->sp - 2] = t;
    m->pc++;
}
void op_jz(struct vm *m)    /* pop; jump if it was zero */
{
    if (m->stack[--m->sp] == 0)
        m->pc = m->code[m->pc + 1];
    else
        m->pc += 2;
}
void op_jmp(struct vm *m)   { m->pc = m->code[m->pc + 1]; }
void op_print(struct vm *m) { printf("  out: %ld\n", m->stack[--m->sp]); m->pc++; }
void op_halt(struct vm *m)  { m->running = 0; }

/* The dispatch table, in the same order as enum opcode. */
void (*const handler[NOPS])(struct vm *) = {
    op_push, op_add, op_sub, op_mul, op_dup, op_swap, op_jz, op_jmp,
    op_print, op_halt, op_over, op_drop
};

void run(const char *title, const int *code, int trace)
{
    struct vm m;
    int op;

    m.code = code;
    m.pc = 0;
    m.sp = 0;
    m.running = 1;
    m.steps = 0;
    printf("%s\n", title);
    while (m.running) {
        op = code[m.pc];
        if (op < 0 || op >= NOPS) {
            printf("  bad opcode %d at %d\n", op, m.pc);
            break;
        }
        if (trace)
            printf("  %2d: %-5s sp=%d\n", m.pc, op_name[op], m.sp);
        /* fetch, look up, call: the heart of every interpreter */
        handler[op](&m);
        m.steps++;
    }
    printf("  (%ld instructions executed)\n", m.steps);
}

int main(void)
{
    /* Count down from 3 to 1. Stack holds the counter. */
    const int countdown[] = {
        PUSH, 3,            /*  0: n = 3                */
        DUP, JZ, 12,        /*  2: if n == 0 goto 12     */
        DUP, PRINT,         /*  5: print n               */
        PUSH, 1, SUB,       /*  7: n = n - 1             */
        JMP, 2,             /* 10: loop                  */
        DROP, HALT          /* 12: done                  */
    };

    /* 10! by repeated multiplication. The stack holds [acc, n]. */
    const int factorial[] = {
        PUSH, 1, PUSH, 10,  /*  0: acc = 1, n = 10           */
        DUP, JZ, 16,        /*  4: if n == 0 goto 16         */
        SWAP, OVER, MUL,    /*  7: [n, acc*n]                */
        SWAP,               /* 10: [acc*n, n]                */
        PUSH, 1, SUB,       /* 11: n = n - 1                 */
        JMP, 4,             /* 14: loop                      */
        DROP, PRINT, HALT   /* 16: drop n, print acc         */
    };

    /*
     * Step through op_swap and op_over in See and watch m.stack in
     * run's frame change: the handlers reach it through the pointer m.
     */
    run("countdown, traced:", countdown, 1);
    run("10 factorial:", factorial, 0);
    return 0;
}

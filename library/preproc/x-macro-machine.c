/*
 * title: A tiny stack machine built from an X-macro opcode table
 * level: 4
 * about: Describes every instruction once in an X-macro and generates the opcode enum, the mnemonic table, the operand counts and a disassembler, then runs a program that computes factorials.
 */
#include <stdio.h>

/*
 * One line per instruction: name, number of operand words, and a
 * short description. Everything else in the machine is generated
 * from this table, so adding an instruction means adding one line
 * here and one case in run().
 */
#define OPCODES                                    \
    X(HALT,  0, "stop the machine")                \
    X(PUSH,  1, "push the operand")                \
    X(LOAD,  1, "push variable [operand]")         \
    X(STORE, 1, "pop into variable [operand]")     \
    X(ADD,   0, "pop two, push sum")               \
    X(SUB,   0, "pop two, push difference")        \
    X(MUL,   0, "pop two, push product")           \
    X(JZ,    1, "pop; jump to operand if zero")    \
    X(JMP,   1, "jump to operand")                 \
    X(PRINT, 0, "pop and print")

#define X(name, n, doc) OP_ ## name,
enum opcode { OPCODES OP_COUNT };
#undef X

#define X(name, n, doc) #name,
static const char *op_name[] = { OPCODES };
#undef X

#define X(name, n, doc) n,
static const int op_args[] = { OPCODES };
#undef X

#define X(name, n, doc) doc,
static const char *op_doc[] = { OPCODES };
#undef X

#define STACK_SIZE 16
#define VARS 4

/*
 * The program: for k = 1..5 print k!. Variable 0 is k, variable 1 is f.
 * Jump targets are word offsets into this array, shown on the left.
 */
static const int code[] = {
    /*  0 */ OP_PUSH, 1, OP_STORE, 0,           /* k = 1              */
    /*  4 */ OP_PUSH, 1, OP_STORE, 1,           /* f = 1              */
    /*  8 */ OP_LOAD, 0, OP_PUSH, 6, OP_SUB,    /* k - 6              */
    /* 13 */ OP_JZ, 34,                         /* if zero, finish    */
    /* 15 */ OP_LOAD, 1, OP_LOAD, 0, OP_MUL,    /* f * k              */
    /* 20 */ OP_STORE, 1, OP_LOAD, 1, OP_PRINT, /* f = that; print f  */
    /* 25 */ OP_LOAD, 0, OP_PUSH, 1, OP_ADD,    /* k + 1              */
    /* 30 */ OP_STORE, 0,                       /* k = that           */
    /* 32 */ OP_JMP, 8,                         /* round again        */
    /* 34 */ OP_HALT
};

static void disassemble(const int *prog, int len)
{
    int pc = 0;
    while (pc < len) {
        int op = prog[pc];
        printf("  %2d  %-5s", pc, op_name[op]);
        if (op_args[op] == 1)
            printf(" %3d", prog[pc + 1]);
        else
            printf("    ");
        printf("   ; %s\n", op_doc[op]);
        pc += 1 + op_args[op];
    }
}

static int run(const int *prog)
{
    int stack[STACK_SIZE];
    int vars[VARS];
    int sp = 0, pc = 0, a, b, steps = 0;

    for (a = 0; a < VARS; a++)
        vars[a] = 0;

    for (;;) {
        int op = prog[pc];
        int arg = op_args[op] ? prog[pc + 1] : 0;
        pc += 1 + op_args[op];
        steps++;
        switch (op) {
        case OP_HALT:  return steps;
        case OP_PUSH:  stack[sp++] = arg; break;
        case OP_LOAD:  stack[sp++] = vars[arg]; break;
        case OP_STORE: vars[arg] = stack[--sp]; break;
        case OP_ADD:   b = stack[--sp]; a = stack[--sp]; stack[sp++] = a + b; break;
        case OP_SUB:   b = stack[--sp]; a = stack[--sp]; stack[sp++] = a - b; break;
        case OP_MUL:   b = stack[--sp]; a = stack[--sp]; stack[sp++] = a * b; break;
        case OP_JZ:    if (stack[--sp] == 0) pc = arg; break;
        case OP_JMP:   pc = arg; break;
        case OP_PRINT: printf("  out: %d\n", stack[--sp]); break;
        default:       printf("bad opcode %d\n", op); return steps;
        }
    }
}

int main(void)
{
    int n;

    printf("%d instructions in the table\n", (int)OP_COUNT);

    printf("listing:\n");
    disassemble(code, (int)(sizeof code / sizeof code[0]));
    printf("running:\n");
    n = run(code);
    printf("  halted after %d steps\n", n);

    /*
     * Step into run() and watch stack[] and sp in the locals pane: the
     * machine's own stack lives inside the C function's stack frame.
     */
    return 0;
}

/*
 * title: An assembler and a stack virtual machine
 * level: 4
 * about: Assembles a small program with labels into bytecode, lists it, then runs it on a stack machine to print factorials.
 * input: ; print n! for n = 1 .. 8\n        PUSH 1\n        STORE 0      ; r0 = n\n        PUSH 1\n        STORE 1      ; r1 = n!\nloop:   LOAD 0\n        PUSH 9\n        LT\n        JZ done      ; stop when n reaches 9\n        LOAD 1\n        LOAD 0\n        MUL\n        DUP\n        STORE 1\n        PRINT\n        LOAD 0\n        PUSH 1\n        ADD\n        STORE 0\n        JMP loop\ndone:   HALT\n
 */

/* Three .c files: asm.c (text to numbers), vm.c (runs the numbers) and
 * main.c. See compiles each one separately and links them together. The
 * struct vm is over 1 KB, so it is static here rather than on the stack;
 * find it in the globals panel and watch stack[] and sp while it runs.
 * The VM's stack is just an int array inside a C struct: a machine
 * simulated inside the machine that See is simulating. */
#include <stdio.h>
#include "vm.h"
#include "asm.h"

static struct vm machine;

int main(void)
{
    if (!assemble(&machine)) {
        return 0;
    }
    printf("%d words of code:\n", machine.ncode);
    disassemble(&machine);

    printf("running:\n");
    if (vm_run(&machine, 10000L)) {
        printf("halted after %ld instructions\n", machine.steps);
    }
    return 0;
}

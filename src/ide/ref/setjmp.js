/* The C reference: <setjmp.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  jmp_buf: {
    text: 'jmp_buf is the array type that setjmp fills in and longjmp reads: a snapshot of where the program was, so that it can come back there later. Here it is an array of 6 ints holding a check word, the depth of the call stack, the stack pointer, the frame pointer and the address to resume at.\n\nBecause it is an array type, passing a jmp_buf to a function passes a pointer to it, which is why setjmp(env) can fill it in without an &.\n\nThe saved state is only valid while the function that called setjmp is still running. Once that function returns, its stack frame is gone and a longjmp to the jmp_buf is undefined behaviour.',
    example: `#include <stdio.h>
#include <setjmp.h>

static jmp_buf env;

int main(void)
{
    printf("a jmp_buf here is %d bytes\\n", (int)sizeof(jmp_buf));
    if (setjmp(env) == 0)
        printf("snapshot taken\\n");
    return 0;
}
`,
    see: ['setjmp', 'longjmp'],
  },
  setjmp: {
    text: 'setjmp(env) saves the current point of execution in env and returns 0. Later, longjmp(env, val) makes that same setjmp call return a second time, now with the value val. So the code after setjmp must look at the return value to know whether it is running for the first time or has just jumped back.\n\nThe standard only allows setjmp in a few places: as the whole controlling expression of if, switch, while or do, compared with a constant (setjmp(env) == 0), negated with !, or as a whole expression statement. Do not store its result with = in a larger expression.\n\nLocal variables of the calling function that were changed between setjmp and longjmp have indeterminate values after the jump unless they are declared volatile.\n\nIn See you can watch it happen: after longjmp the call stack shrinks back to the function that called setjmp, and the frames in between disappear from the memory picture without ever returning.',
    example: `#include <stdio.h>
#include <setjmp.h>

static jmp_buf on_error;

static int divide(int a, int b)
{
    if (b == 0)
        longjmp(on_error, 1);
    return a / b;
}

int main(void)
{
    if (setjmp(on_error) == 0) {
        printf("10 / 2 = %d\\n", divide(10, 2));
        printf("10 / 0 = %d\\n", divide(10, 0));
        printf("never printed\\n");
    } else {
        printf("caught a division by zero\\n");
    }
    return 0;
}
`,
    see: ['longjmp', 'jmp_buf', 'stack frame', 'volatile'],
  },
  longjmp: {
    text: 'longjmp(env, val) jumps back to the setjmp call that filled env, throwing away every stack frame created since. That setjmp then returns val. If val is 0 it returns 1 instead, so the code can always tell a jump from the first return.\n\nlongjmp never returns. It is C\'s nearest thing to throwing an exception: a deeply nested function can give up and land straight back in an error handler.\n\nThe function that called setjmp must still be active. Jumping to a jmp_buf whose function has already returned is undefined behaviour, as is jumping out of a signal handler that interrupted library code. Anything the skipped functions allocated with malloc or opened with fopen is not cleaned up for you.',
    example: `#include <stdio.h>
#include <setjmp.h>

static jmp_buf env;

static void depth(int n)
{
    printf("going down: %d\\n", n);
    if (n == 3)
        longjmp(env, n * 10);
    depth(n + 1);
    printf("not reached\\n");
}

int main(void)
{
    int r = setjmp(env);

    if (r == 0)
        depth(1);
    else
        printf("back in main with %d\\n", r);
    return 0;
}
`,
    see: ['setjmp', 'jmp_buf', 'exit'],
  },
});

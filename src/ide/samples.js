// The first program, and the /examples folder: small projects that show one idea each.
(function (SEE) {
  'use strict';
  const Samples = SEE.Samples = {};

  Samples.starter = () => `/* hello.c: your first program in See.
   Press F5 to start it in the debugger, then F10 to go one line at a time
   and watch the memory picture on the right change. */
#include <stdio.h>
#include <stdlib.h>

int square(int n)
{
    int result = n * n;
    return result;
}

int main(void)
{
    int x = 7;
    int y = square(x);
    char greeting[] = "hello";        /* an array on the stack, a copy of the text */
    const char *who = "world";        /* a pointer to text in read-only memory */
    int *numbers = malloc(3 * sizeof(int));   /* three ints on the heap */

    numbers[0] = x;
    numbers[1] = y;
    numbers[2] = x + y;
    printf("%s, %s! %d squared is %d\\n", greeting, who, x, y);
    free(numbers);
    return 0;
}
`;

  /** Install the examples folder (read-only originals) */
  Samples.install = function (app) {
    const v = app.vfs;
    const all = SEE.SampleFiles || {};
    v.mkdir('/examples', { exist: true, trusted: true });
    for (const [path, text] of Object.entries(all)) {
      const full = '/examples/' + path;
      v.mkdir(full.replace(/\/[^/]*$/, ''), { parents: true, exist: true, trusted: true });
      let old = null;
      try { old = v.exists(full) ? v.readText(full) : null; } catch (e) { old = null; }
      if (old !== text) v.writeText(full, text, { trusted: true });
    }
    const e = v.entries.get('/examples');
    if (e) e.readOnly = true;
  };
})(SEE);

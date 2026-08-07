// Reading the header comment of a library program:
//   /*
//    * title: Linked list of words
//    * level: 2
//    * about: Reads words and keeps them in a sorted linked list.
//    * input: the quick brown fox
//    * args: one two
//    * expect: fault
//    */
export function meta(text) {
  const m = /^\/\*([\s\S]*?)\*\//.exec(text.trimStart());
  const out = {};
  if (!m) return out;
  let key = null;
  for (const raw of m[1].split('\n')) {
    const line = raw.replace(/^\s*\*?\s?/, '');
    const kv = /^(title|level|about|input|args|expect|tags|steps):\s*(.*)$/.exec(line);
    if (kv) { key = kv[1]; out[key] = kv[2]; continue; }
    if (key && line.trim() && /^\s+\S/.test(line) && key !== 'title') out[key] += ' ' + line.trim();
    else key = null;
  }
  if (out.level) out.level = +out.level || 1;
  if (out.input) out.input = out.input.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  return out;
}

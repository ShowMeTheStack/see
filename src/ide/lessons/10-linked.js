// Unit 10: linked structures on the heap.
SEE.Lessons.add({
  id: 'list-build', unit: 'Linked structures', title: 'Building a linked list',
  blurb: 'Three malloc calls make three heap nodes, and next pointers chain them together.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a linked list, built one heap node at a time */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;    /* address of the next node, or NULL */
};

int main(void)
{
    struct node *first;
    struct node *second;
    struct node *third;

    first = malloc(sizeof(struct node));
    first->value = 10;
    second = malloc(sizeof(struct node));
    second->value = 20;
    first->next = second;          /* link 1 -> 2 */
    third = malloc(sizeof(struct node));
    third->value = 30;
    third->next = NULL;            /* the end of the list */
    second->next = third;          /* link 2 -> 3 */
    printf("%d %d %d\\n", first->value, first->next->value, first->next->next->value);
    free(third);
    free(second);
    free(first);
    return 0;
}
`,
  },
  intro: '<p>An array keeps its elements side by side. A <b>linked list</b> keeps each element in its own block of memory, a <b>node</b>, and each node holds the address of the next one.</p><p><code>struct node</code> has a field that is a pointer to another <code>struct node</code>. That is allowed because a pointer has a known size even before the struct is complete.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 16, text: '<p>Three pointers in <code>main</code>\'s frame, all red. No node exists yet: the heap is empty.</p>' },
    { do: 'over', line: 17, check: 'first != 0', text: '<p><code>malloc</code> reserved one 8-byte block on the <b>heap</b>, near <code>0x0804a000</code>, and returned its address. <code>first</code> holds it: follow the arrow from the stack to the heap.</p><p>The block\'s two fields are red: <code>malloc</code> does not clear memory.</p>' },
    { do: 'over', line: 18, check: 'first->value == 10', text: '<p><code>first-&gt;value = 10;</code> wrote into the heap block, not into the frame.</p>' },
    { do: 'over', times: 2, line: 20, check: 'second->value == 20', text: '<p>A second, separate heap block, with its own address. Nothing yet connects the two nodes: each is reached only from a pointer in <code>main</code>\'s frame.</p>' },
    { do: 'over', line: 21, check: 'first->next == second', text: '<p>Line 20 stored the address of the second node in the <code>next</code> field of the first. A new arrow goes from heap block to heap block. That arrow is the link.</p>' },
    { do: 'over', times: 3, line: 24, check: 'third->value == 30 && third->next == 0', text: '<p>A third node, with <code>next</code> set to <code>NULL</code>: no arrow comes out of it. <code>NULL</code> marks the end of the list.</p>' },
    { do: 'over', line: 25, check: 'second->next == third && first->next->next == third', text: '<p>Now the chain is complete: <code>first</code> &rarr; 10 &rarr; 20 &rarr; 30 &rarr; NULL.</p><p>The nodes need not be next to each other, or in order. Only the arrows give the order.</p>' },
    { do: 'over', line: 26, show: 'term', output: '10 20 30', text: '<p><code>first-&gt;next-&gt;next-&gt;value</code> followed two arrows from the first node to reach 30. In a real program you do not need <code>second</code> and <code>third</code> at all: <code>first</code> alone reaches every node.</p>' },
    { do: 'over', times: 3, line: 29, check: 'first != 0', text: '<p>The three <code>free</code> calls gave the blocks back. They are hatched now. <code>first</code> still holds the old address: its arrow points into freed memory, and using it would be a bug.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="note">Every <code>malloc</code> may return <code>NULL</code> when memory runs out. Real code checks before writing through the pointer; these lessons leave it out to keep the programs short.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'list-walk', unit: 'Linked structures', title: 'Walking a list',
  blurb: 'One pointer hops from node to node with p = p->next until it reaches NULL.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: walking a list with a pointer */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

struct node *push(struct node *head, int value)
{
    struct node *n = malloc(sizeof(struct node));
    n->value = value;
    n->next = head;          /* the new node goes in front */
    return n;
}

int main(void)
{
    struct node *head = NULL;
    struct node *p;
    int sum = 0;

    head = push(head, 3);
    head = push(head, 2);
    head = push(head, 1);
    for (p = head; p != NULL; p = p->next) {
        sum = sum + p->value;
        printf("visit %d\\n", p->value);
    }
    printf("sum %d\\n", sum);
    while (head != NULL) {   /* free every node */
        p = head->next;      /* remember the rest first */
        free(head);
        head = p;
    }
    return 0;
}
`,
  },
  intro: '<p>To visit every node you need just one pointer. Start it at the head, and after each node move it on with <code>p = p-&gt;next</code>. When it becomes <code>NULL</code> you have passed the last node.</p><p>The <code>for</code> loop on line 27 is the usual way to write this.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 20, text: '<p><code>head</code>, <code>p</code> and <code>sum</code> are in <code>main</code>\'s frame. The heap is empty.</p>' },
    { do: { to: 27 }, line: 27, check: 'head->value == 1 && head->next->value == 2 && head->next->next->value == 3', text: '<p><code>push</code> was called three times. Each call made a node and put it in front, so the list reads 1 &rarr; 2 &rarr; 3 even though 3 was made first. Follow the arrows from <code>head</code>.</p>' },
    { do: 'over', line: 28, check: 'p == head', text: '<p><code>p = head</code>: now two arrows point at the first node, one from <code>head</code> and one from <code>p</code>. Only <code>p</code> will move; <code>head</code> must stay, or the list would be lost.</p>' },
    { do: 'over', times: 3, line: 28, show: 'term', output: 'visit 1', check: 'p == head->next && sum == 1', text: '<p>The loop body ran once, then <code>p = p-&gt;next</code> on line 27 copied the first node\'s <code>next</code> into <code>p</code>. Watch <code>p</code>\'s arrow: it hopped to the second node.</p>' },
    { do: 'over', times: 3, line: 28, output: 'visit 2', check: 'p->value == 3 && p->next == 0', text: '<p>One more hop: <code>p</code> is at the last node, whose <code>next</code> is <code>NULL</code>.</p>' },
    { do: { to: 31 }, line: 31, check: 'p == 0 && sum == 6', text: '<p>After the last node, <code>p = p-&gt;next</code> made <code>p</code> <code>NULL</code>. The test <code>p != NULL</code> failed and the loop ended. <code>p</code> has no arrow now.</p>' },
    { do: 'over', line: 32, output: 'sum 6', text: '<p>1 + 2 + 3 = 6. The list is unchanged: walking it only read the nodes.</p>' },
    { do: { to: 34 }, line: 34, check: 'p == head->next', text: '<p>The second loop frees the nodes. Before freeing <code>head</code>, line 33 saved <code>head-&gt;next</code> in <code>p</code>: once a node is freed, reading its <code>next</code> field is no longer allowed.</p>' },
    { do: { to: 37 }, line: 37, check: 'head == 0', text: '<p>All three blocks are hatched (freed) and <code>head</code> is <code>NULL</code>.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended.</p><div class="try">Try it: swap lines 33 and 34 (free first, then read <code>head-&gt;next</code>) and debug again. See stops the program when it reads freed memory.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'list-insert-front', unit: 'Linked structures', title: 'Insert at the front',
  blurb: 'To change the caller\'s head pointer, pass its address: a pointer to a pointer.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: insert at the front through a pointer to the head pointer */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

void push_wrong(struct node *head, int value)    /* gets a copy of head */
{
    struct node *n = malloc(sizeof(struct node));
    n->value = value;
    n->next = head;
    head = n;              /* changes only the copy */
}

void push(struct node **headp, int value)        /* gets the address of head */
{
    struct node *n = malloc(sizeof(struct node));
    n->value = value;
    n->next = *headp;
    *headp = n;            /* changes main's head */
}

int main(void)
{
    struct node *head = NULL;

    push_wrong(head, 5);
    printf("after push_wrong: head is %s\\n", head == NULL ? "NULL" : "set");
    push(&head, 7);
    push(&head, 8);
    printf("list: %d %d\\n", head->value, head->next->value);
    free(head->next);
    free(head);
    return 0;
}
`,
  },
  intro: '<p>Inserting at the front changes which node is first, so it must change the caller\'s <code>head</code> pointer. A function gets only copies of its arguments, so passing <code>head</code> is not enough.</p><p>The fix is the same as for an <code>int</code>: pass the address of the variable. The variable is a <code>struct node *</code>, so its address is a <code>struct node **</code>.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 28, text: '<p><code>main</code> has one pointer, <code>head</code>. It is about to become <code>NULL</code>: an empty list.</p>' },
    { do: 'over', line: 30, check: 'head == 0', text: '<p>The list is empty. Now try the wrong way first.</p>' },
    { do: 'into', line: 12, check: 'head == 0', text: '<p>The frame of <code>push_wrong</code> has its own <code>head</code>, a copy of <code>main</code>\'s <code>NULL</code>. Two variables with the same name, in two frames.</p>' },
    { do: { to: 16 }, line: 16, check: 'head == n && n->value == 5', text: '<p>A heap node holding 5 was made, and line 15 pointed the <b>local</b> <code>head</code> at it. Look at <code>main</code>\'s frame below: its <code>head</code> is still <code>NULL</code>.</p><p>The only pointers to the new heap block are <code>n</code> and <code>head</code>, both in this frame.</p>' },
    { do: { to: 31 }, line: 31, check: 'head == 0', text: '<p><code>push_wrong</code> returned and its frame vanished, taking the only pointers to the node with it. The block is still on the heap, but nothing points to it: no arrow leads there. It can never be used or freed. That is a <b>memory leak</b>.</p>' },
    { do: 'over', line: 32, show: 'term', output: 'after push_wrong: head is NULL', text: '<p>The list is still empty, and one heap block is lost for good.</p>' },
    { do: 'into', line: 20, check: '*headp == 0', text: '<p>This time the parameter is <code>headp</code>, the address of <code>main</code>\'s <code>head</code>. Its arrow points down into <code>main</code>\'s frame, at the pointer variable itself.</p><p><code>*headp</code> means "<code>main</code>\'s <code>head</code>", so reading it gives <code>NULL</code> and writing it changes <code>main</code>.</p>' },
    { do: { to: 24 }, line: 24, check: '*headp == n && n->next == 0', text: '<p>Line 22 linked the new node to the old first node (none yet, so <code>NULL</code>). Line 23 wrote the node\'s address through <code>headp</code>: <code>main</code>\'s <code>head</code> turned yellow and now has an arrow to the node holding 7.</p>' },
    { do: { to: 34 }, line: 34, check: 'head->value == 8 && head->next->value == 7', text: '<p>The second <code>push</code> put 8 in front of 7. The order is the reverse of the calls, as always when inserting at the front.</p>' },
    { do: 'over', output: 'list: 8 7', text: '<p>The two nodes reached through <code>head</code> print as 8 and 7.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The two list nodes were freed on lines 35 and 36. The node holding 5 was never freed: nothing could reach it.</p><div class="note">Rule: if a function must change a variable of the caller, it needs that variable\'s address. For a pointer variable that means a pointer to a pointer. The other common style is to <i>return</i> the new head, as in <code>head = push(head, 7);</code>.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'list-delete', unit: 'Linked structures', title: 'Deleting a node',
  blurb: 'Unlink a node by pointing around it, then free it and forget its address.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: unlink a node from the list, then free it */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

struct node *push(struct node *head, int value)
{
    struct node *n = malloc(sizeof(struct node));
    n->value = value;
    n->next = head;
    return n;
}

int main(void)
{
    struct node *head = NULL;
    struct node *prev;
    struct node *gone;

    head = push(head, 30);
    head = push(head, 20);
    head = push(head, 10);       /* list: 10 -> 20 -> 30 */

    prev = head;                 /* the node before the one to delete */
    gone = prev->next;           /* the node holding 20 */
    prev->next = gone->next;     /* point around it: 10 -> 30 */
    free(gone);                  /* give its memory back */
    gone = NULL;                 /* do not keep a dangling address */
    printf("%d %d\\n", head->value, head->next->value);
    free(head->next);
    free(head);
    return 0;
}
`,
  },
  intro: '<p>Deleting a node is two separate jobs:</p><ul><li><b>unlink</b> it: make the node before it point to the node after it, so the list skips it;</li><li><b>free</b> it: give its heap block back.</li></ul><p>The order matters. Once a node is freed you may not read its <code>next</code> field.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 20, text: '<p>Three pointers in <code>main</code>. The list is built on lines 24 to 26.</p>' },
    { do: { to: 28 }, line: 28, check: 'head->value == 10 && head->next->value == 20 && head->next->next->value == 30', text: '<p>The list is 10 &rarr; 20 &rarr; 30. The node holding 20 will be deleted.</p>' },
    { do: 'over', times: 2, line: 30, check: 'prev == head && gone->value == 20', text: '<p><code>prev</code> points at the node before it, <code>gone</code> at the node itself. To delete from a singly linked list you always need the node <i>before</i>: its <code>next</code> field is the one that must change.</p>' },
    { do: 'over', line: 31, check: 'head->next->value == 30', text: '<p><code>prev-&gt;next = gone-&gt;next;</code> made the 10 node point straight at the 30 node. Its arrow jumped over 20.</p><p>The 20 node still exists, and still points at 30, but walking from <code>head</code> no longer reaches it. Only <code>gone</code> does.</p>' },
    { do: 'over', line: 32, check: 'gone != 0', text: '<p><code>free(gone)</code> returned the block. It is hatched now.</p><p><code>gone</code> still holds the old address: it is a <b>dangling pointer</b>. Writing <code>gone-&gt;value</code> now would use memory that no longer belongs to the program.</p>' },
    { do: 'over', line: 33, check: 'gone == 0', text: '<p>Setting it to <code>NULL</code> removes the arrow. A <code>NULL</code> pointer is easy to test for; a dangling one looks just like a good one.</p>' },
    { do: 'over', line: 34, show: 'term', output: '10 30', text: '<p>Walking from <code>head</code> now finds 10 and 30.</p>' },
    { do: 'continue', state: 'exited', text: '<p>The other two nodes were freed and the program ended.</p><div class="try">Try it: swap lines 30 and 31 (free first, then unlink) and debug again. Line 31 then reads <code>gone-&gt;next</code> from a freed block, and See stops the program there.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'list-stack', unit: 'Linked structures', title: 'A stack on a list',
  blurb: 'push puts a node on top, pop takes the top node off and frees it.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a stack built on a linked list */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

struct node *top = NULL;     /* a global: the top of the stack */

void push(int value)
{
    struct node *n = malloc(sizeof(struct node));
    n->value = value;
    n->next = top;
    top = n;
}

int pop(void)                /* call only when the stack is not empty */
{
    struct node *n = top;
    int value = n->value;
    top = n->next;
    free(n);
    return value;
}

int main(void)
{
    push(1);
    push(2);
    push(3);
    printf("pop %d\\n", pop());
    printf("pop %d\\n", pop());
    push(9);
    while (top != NULL)
        printf("pop %d\\n", pop());
    return 0;
}
`,
  },
  intro: '<p>A <b>stack</b> is a pile: you add on top (<b>push</b>) and take from the top (<b>pop</b>), so the last thing in is the first out.</p><p>The front of a linked list is a perfect top: adding or removing there takes the same few steps however long the list is. Here <code>top</code> is a global variable, so both functions can use it without passing it around.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 31, check: 'top == 0', text: '<p><code>top</code> is not in any frame: it is a global, drawn in the globals area. It starts as <code>NULL</code>, an empty stack.</p>' },
    { do: { to: 34 }, line: 34, check: 'top->value == 3 && top->next->value == 2 && top->next->next->value == 1', text: '<p>Three pushes made three heap nodes. The arrow from the global <code>top</code> goes to 3, the last one pushed, then 2, then 1.</p>' },
    { do: 'into', line: 22, text: '<p>Line 34 calls <code>pop</code> first (its result is needed before <code>printf</code> can run). <code>pop</code>\'s frame is on the stack; <code>n</code> and <code>value</code> are red.</p>' },
    { do: { to: 25 }, line: 25, check: 'value == 3 && top->value == 2', text: '<p><code>n</code> holds the old top node and <code>value</code> copied its 3 out. Line 24 moved the global <code>top</code> to the next node, 2.</p><p>The order matters: <code>value</code> and <code>n-&gt;next</code> were read <i>before</i> the free on line 25.</p>' },
    { do: 'over', line: 26, check: 'value == 3', text: '<p>The old top node is hatched: freed. <code>value</code> is a copy in the frame, so it is still safe to return.</p>' },
    { do: { to: 35 }, line: 35, show: 'term', output: 'pop 3', text: '<p>The last in, 3, came out first. Its frame is gone and so is its node.</p>' },
    { do: { to: 37 }, line: 37, output: 'pop 2', check: 'top->value == 9 && top->next->value == 1', text: '<p>2 was popped, then 9 pushed. The stack is now 9 on top of 1.</p><p>The heap may reuse a freed block for the new node: look at the address of the 9 node.</p>' },
    { do: 'continue', state: 'exited', output: 'pop 1', check: 'top == 0', text: '<p>The loop popped 9 and then 1 until <code>top</code> was <code>NULL</code>. Every node was freed by <code>pop</code>.</p><div class="note"><code>pop</code> on an empty stack would read <code>n-&gt;value</code> through a <code>NULL</code> pointer. A safer <code>pop</code> checks <code>top != NULL</code> first.</div>' },
  ],
});

SEE.Lessons.add({
  id: 'bst', unit: 'Linked structures', title: 'A binary search tree',
  blurb: 'Each node has two arrows: smaller keys go left, bigger keys go right.',
  main: 'main.c',
  files: {
    'main.c': `/* main.c: a small binary search tree */
#include <stdio.h>
#include <stdlib.h>

struct tree {
    int key;
    struct tree *left;     /* smaller keys */
    struct tree *right;    /* bigger keys  */
};

struct tree *insert(struct tree *t, int key)
{
    if (t == NULL) {
        t = malloc(sizeof(struct tree));
        t->key = key;
        t->left = NULL;
        t->right = NULL;
    } else if (key < t->key)
        t->left = insert(t->left, key);
    else
        t->right = insert(t->right, key);
    return t;
}

void print_in_order(struct tree *t)
{
    if (t == NULL)
        return;
    print_in_order(t->left);
    printf("%d ", t->key);
    print_in_order(t->right);
}

int main(void)
{
    struct tree *root = NULL;

    root = insert(root, 50);
    root = insert(root, 30);
    root = insert(root, 70);
    root = insert(root, 40);
    print_in_order(root);
    printf("\\n");
    return 0;
}
`,
  },
  intro: '<p>A <b>binary search tree</b> is a linked structure where each node has two links. Everything reached through <code>left</code> has a smaller key, everything through <code>right</code> a bigger one. To find a key you go left or right at each node, so you skip half of what is left at every step.</p><p><code>insert</code> is recursive: it walks down until it finds an empty place (<code>NULL</code>) and puts the new node there.</p>',
  steps: [
    { do: 'start', show: 'memory', line: 36, text: '<p><code>root</code> will point at the top node of the tree. The tree starts empty.</p>' },
    { do: 'over', times: 2, line: 39, check: 'root->key == 50 && root->left == 0 && root->right == 0', text: '<p>Inserting into an empty tree made one heap node, 50, with two <code>NULL</code> links. It is the root.</p>' },
    { do: 'into', line: 13, check: 't->key == 50', text: '<p>Inserting 30. <code>insert</code>\'s frame has <code>t</code>, pointing at the root node, and <code>key</code> = 30.</p>' },
    { do: 'over', line: 18, text: '<p><code>t</code> is not <code>NULL</code>, so the debugger skipped to line 18 to compare keys.</p>' },
    { do: 'over', line: 19, check: 'key < t->key', text: '<p>30 &lt; 50, so the next line to run is 19: go left.</p>' },
    { do: 'into', line: 13, check: 't == 0 && key == 30', text: '<p>Now there are two <code>insert</code> frames on the stack, one per level of the tree. The new one got <code>t-&gt;left</code> of the root, which is <code>NULL</code>: this is the empty place where 30 belongs.</p>' },
    { do: { to: 22 }, line: 22, check: 't->key == 30 && t->left == 0', text: '<p>A new heap node, 30. The inner frame\'s <code>t</code> points at it, but the root\'s <code>left</code> is still <code>NULL</code>: the link is made when this call returns.</p>' },
    { do: 'out', line: 19, check: 't->key == 50 && t->left == 0', text: '<p>The inner frame is gone and the outer one is back on top, still on line 19. The call has returned the new node\'s address, but the assignment to <code>t-&gt;left</code> has not happened yet: the root\'s <code>left</code> is still <code>NULL</code>.</p>' },
    { do: 'over', line: 22, check: 't->left->key == 30', text: '<p>Now line 19 is finished: the root\'s <code>left</code> holds the address of the 30 node, and an arrow goes from the root down to it. The node that was reachable only from a dead frame is now part of the tree.</p>' },
    { do: { to: 42 }, line: 42, check: 'root->left->key == 30 && root->right->key == 70 && root->left->right->key == 40', text: '<p>70 went right of 50. 40 went left of 50 (40 &lt; 50), then right of 30 (40 &gt; 30). In the memory picture each node has two arrow slots:</p><ul><li>50: left &rarr; 30, right &rarr; 70</li><li>30: left NULL, right &rarr; 40</li><li>70 and 40: both NULL (leaves)</li></ul>' },
    { do: 'over', times: 2, line: 44, show: 'term', output: '30 40 50 70', text: '<p><code>print_in_order</code> prints the left subtree, then the node, then the right subtree. For a search tree that gives the keys in sorted order.</p><p>The keys appeared only after line 43: the terminal is line-buffered, so text waits until a newline is printed.</p><div class="try">Try it: step into <code>print_in_order</code> instead and watch the frames pile up as it goes down the left side.</div>' },
    { do: 'continue', state: 'exited', text: '<p>The program ended. It did not free the tree; a <code>free_tree</code> function would free both subtrees first, then the node, in the same recursive shape.</p>' },
  ],
});

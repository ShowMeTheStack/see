/*
 * title: Removing from a list and leaving a dangling link
 * level: 4
 * about: Keeps a to-do list as a linked list; the remove function frees the node but forgets to unlink it.
 * expect: fault
 */

/*
 * THE PUZZLE
 * remove_task() finds the task, frees it, and returns. Removing the
 * first task works (head is updated). Removing a task from the middle
 * looks as if it works too: no crash at that moment. The crash comes
 * later, in print_list, far from the real mistake. That is typical of
 * memory bugs, and it is why finding the line that crashed is only
 * the start.
 *
 * HOW TO HUNT IT WITH SEE
 * Debug with F5 and step over the build-up so the heap shows four
 * blocks linked by arrows. Step into the second remove_task (F11) and
 * watch it free the "post letter" node. Look at the arrow from the
 * node before it, "buy milk": it still points at the block that has
 * just been freed. When print_list follows that arrow, See stops with
 * use after free. From there, press F8 repeatedly (or Shift+F8 for one
 * statement at a time) to walk back to the free, and ask: which
 * pointer should have changed at that moment, and did not?
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct task {
    char text[24];
    struct task *next;
};

static struct task *append(struct task *head, const char *text)
{
    struct task *t = malloc(sizeof *t);
    struct task *p;

    if (t == NULL)
        exit(1);
    strncpy(t->text, text, sizeof t->text - 1);
    t->text[sizeof t->text - 1] = '\0';
    t->next = NULL;
    if (head == NULL)
        return t;
    for (p = head; p->next != NULL; p = p->next)
        ;
    p->next = t;
    return head;
}

static struct task *remove_task(struct task *head, const char *text)
{
    struct task *p;

    if (head != NULL && strcmp(head->text, text) == 0) {
        struct task *rest = head->next;
        free(head);
        return rest;
    }
    for (p = head; p != NULL; p = p->next) {
        if (strcmp(p->text, text) == 0) {
            free(p);
            break;
        }
    }
    return head;
}

static void print_list(const struct task *head)
{
    int n = 1;

    for (; head != NULL; head = head->next)
        printf("%d. %s\n", n++, head->text);
}

static void free_list(struct task *head)
{
    struct task *next;

    while (head != NULL) {
        next = head->next;
        free(head);
        head = next;
    }
}

int main(void)
{
    struct task *todo = NULL;

    todo = append(todo, "water plants");
    todo = append(todo, "buy milk");
    todo = append(todo, "post letter");
    todo = append(todo, "call Gran");
    print_list(todo);

    todo = remove_task(todo, "water plants");
    todo = remove_task(todo, "post letter");
    printf("--\n");
    print_list(todo);

    free_list(todo);
    return 0;
}

/*
 * THE FIX
 * Unlinking means changing the next pointer of the node before the one
 * removed, so the loop has to remember that node:
 *
 *     struct task *prev = head;
 *     for (p = head->next; p != NULL; prev = p, p = p->next) {
 *         if (strcmp(p->text, text) == 0) {
 *             prev->next = p->next;
 *             free(p);
 *             break;
 *         }
 *     }
 *
 * Expected output after the removals: 1. buy milk, 2. call Gran.
 * A neat alternative walks a pointer to the link itself
 * (struct task **link = &head), which removes the special case for the
 * first node altogether.
 */

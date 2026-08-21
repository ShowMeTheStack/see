/*
 * title: From a member back to its struct
 * level: 4
 * about: Recovers the address of a whole struct from a pointer to one of its members using offsetof, the trick behind intrusive lists.
 */
#include <stdio.h>
#include <stddef.h>

/*
 * An intrusive list: the link lives INSIDE the data, and the list code
 * only ever sees links. It never knows what kind of struct a link sits in.
 */
struct link {
    struct link *next;
};

struct task {
    int id;
    char label[8];
    struct link hook;      /* not at the start on purpose */
    int priority;
};

/*
 * Given a pointer to the hook member, step back by the hook's offset to
 * reach the start of the task. char * is used so the subtraction counts
 * bytes. This is what the Linux kernel's container_of macro does.
 */
#define TASK_OF(lp) ((struct task *)((char *)(lp) - offsetof(struct task, hook)))

int main(void)
{
    struct task t[3];
    struct link *head;
    struct link *l;
    int i;
    static const char *labels[3] = { "wash", "dry", "fold" };

    for (i = 0; i < 3; i++) {
        t[i].id = 100 + i;
        sprintf(t[i].label, "%s", labels[i]);
        t[i].priority = 3 - i;
    }

    /*
     * Chain the hooks: fold -> wash -> dry. In the memory picture every
     * next arrow lands 12 bytes into a task, on its hook, never at the
     * task's first byte.
     */
    head = &t[2].hook;
    t[2].hook.next = &t[0].hook;
    t[0].hook.next = &t[1].hook;
    t[1].hook.next = NULL;

    printf("hook is %lu bytes into a task\n", (unsigned long)offsetof(struct task, hook));

    for (l = head; l != NULL; l = l->next) {
        struct task *tk = TASK_OF(l);
        printf("link %p -> task %p: #%d %-5s priority %d\n",
               (void *)l, (void *)tk, tk->id, tk->label, tk->priority);
    }

    /* Check: the recovered pointer is exactly &t[1]. */
    printf("TASK_OF(&t[1].hook) == &t[1]: %s\n", TASK_OF(&t[1].hook) == &t[1] ? "yes" : "no");
    return 0;
}

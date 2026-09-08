/*
 * queue.c - a ring-buffer queue that logs what it does.
 *
 * This file asks for every message, down to TRACE, by defining
 * LOG_LEVEL before the include. The header's #ifndef LOG_LEVEL then
 * leaves this value alone.
 */
#define LOG_LEVEL LOG_TRACE
#include "log.h"
#include "queue.h"

#define QSIZE 4

static int items[QSIZE];
static int head = 0, count = 0;

int queue_put(int v)
{
    if (count == QSIZE) {
        LOG_W("queue full, dropped", v);
        return 0;
    }
    items[(head + count) % QSIZE] = v;
    count++;
    LOG_T("put", v);
    return 1;
}

int queue_get(int *out)
{
    if (count == 0) {
        LOG_E("get from empty queue, count is", count);
        return 0;
    }
    *out = items[head];
    head = (head + 1) % QSIZE;
    count--;
    LOG_T("got", *out);
    return 1;
}

import { assign, createMachine, setup } from "xstate";


export const countMatchine = setup({
  types: {
    context: {} as { count: number },
    events: {} as { type: "inc" } | { type: "dec" },
  },
  actions: {
    increment: assign({
        count: ({context}) => context.count + 1
    }),
    decrement: assign({
        count: ({context}) => context.count - 1
    })
  }
}).createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAYgMwG0AGAXUVAAcB7WXAF1yf3pAA9EAjABYAdACYqAZgFiArABoQAT0FUAHCKGzpcgL67FaLHkKkIYSrR7NWHLj34IZilU7H6DIfE3PwkIIxwCYmsWdk5uf0cBAHYRAQBObRkFZUQJBJEEqgA2PQ8gA */
    context: {count: 0},
    on: {
        inc: {
            actions: 'increment'
        },
        dec: {
            actions: 'decrement'
        }
    }
})
import { assign, fromPromise, setup } from "xstate";

export interface FetchMachineContextType<T> {
  method: "GET" | "POST";
  request?: BodyInit;
  headers: Headers;
  isLoading: boolean;
  url?: string;
  error: any;
  retry: number;
  data?: T;
}

type FetchMachineFetchEventType = { type: "FETCH" } & FetchMachineInputType;

export type FetchMachineEventType =
  | {
      type: "ERROR" | "RETRY";
    }
  | FetchMachineFetchEventType;

export type FetchMachineInputType = Omit<
  FetchMachineContextType<object>,
  "data" | "retry" | "error" | "isLoading"
>;

const fetchData = <T>(input: FetchMachineInputType) => {
  const allNull = Object.values(input).every((value) => value === null);

  if (
    allNull ||
    !input.url ||
    (input.method === "POST" && input.request !== null)
  ) {
    return Promise.reject(new Error("No Request Data"));
  }

  const headers = new Headers(input.headers);
  headers.set("Content-Type", "application/json");

  return fetch(input.url, {
    method: input.method,
    headers: headers,
    body: input.request,
  }).then((response) => response.json() as T);
};

export const fetchMachine = setup({
  types: {
    context: {} as FetchMachineContextType<object>,
    events: {} as FetchMachineEventType,
    input: {} as FetchMachineInputType,
    output: {} as object,
  },
  actors: {
    fetchData: fromPromise<unknown, FetchMachineInputType>(
      async ({ input }) => {
        const data = await fetchData(input);
        return data;
      }
    ),
  },
  actions: {
    increaseRetry: assign({ retry: ({ context }) => context.retry + 1 }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QDMwBcDGALAsgQ2wEsA7MAOkIgBswBiAMQFEAVAYQAkBtABgF1FQABwD2sQmkLDiAkAA9EAJm7cyATgAsARnXdVAdgAcqgKx7VmgwBoQAT0UGFZYwc2qDe9Uc3H1AZgBsAL6B1qiYuARYJORUwngQJFC0EFLkJABuwgDW5GHYACJ4aHg8-EggImISUjLyCP66ZP46-sauDqrcev7Wdgia3WTqxr6a3AH+rqNBISB5EUSkZLHxibRgAE4bwhtkglRFyDsAtmTzhcWlMpXiktLldb4KemSjCsbcBv6+T0qavYhNP4yB4GhoDL51HpPgZjDNQuhsPhFrk8IQqABXDZ0ABKLBxAE0ruUbtV7qA6lp1GpfHpjACEABaTQKXxkL56CzNbwKczaYII8LIqJLZBozHY2iyWDFNDkPDIOUbAAU3mUAEpaPNhdEzuKsWBiUJRLcag9EIyFNTPsZ9NplIZfLaFAyWSpVOZjApvlD-KolPC5oiFiLyLAMRgMHBYLQjRUTWTaogHMYnL5Os02iZ1KyGTpNGp3nS9AFvB9jMFZsRhBA4DJtZFotcE3ck0y9I4bXadF0IbaGZbNAWApyvlovXz1AKg0LG0tKDRm1VW+aEKY1MMnt4uW4AuoGQojOyHN0PAorZ8FNOGyjlnEEsQoEvTeS5IhIdSni4t37hv4ra6JaFqorR-CMLh6NewY6qK+rYs+iarueTRfiy9K2O+BhkOe3qTLypgdqyUGzre4aRtGCErhSiB6LRTg+P4RhZj4uYYf0+hDLy-jfJMZbcBWlZAA */
  id: "fetchMachine",
  initial: "idle",
  context: {
    method: "GET",
    headers: new Headers(),
    retry: 0,
    isLoading: false,
    error: undefined,
  },
  states: {
    idle: {
      on: {
        FETCH: {
          target: "loading",
          actions: assign({
            url: ({ event }) => event.url,
            data: undefined,
            error: undefined,
            method: ({ event }) => event.method,
            headers: ({ event }) => event.headers,
          }),
        },
      },
    },
    loading: {
      invoke: {
        id: "fetchData",
        src: "fetchData",
        input: ({ context }) => context,
        onDone: {
          target: "success",
          actions: assign({ data: ({ event }) => event.output }),
        },
        onError: {
          target: "failure",
        },
      },
    },
    failure: {
      entry: assign({
        error: ({ context }) => {
          if (context.retry === 3) {
            return "Error fetching data. Please check network";
          }

          return undefined;
        },
      }),
      after: {
        2000: {
          guard: ({ context }) => context.retry < 3,
          target: "loading",
          actions: ["increaseRetry", assign({ error: undefined })],
        },
      },
      on: {
        RETRY: {
          guard: ({ context }) => context.retry > 0,
          target: "loading",
          actions: assign({
            retry: 0,
            error: undefined,
          }),
        },
      },
    },
    success: {
      always: {
        target: "idle",
      },
    },
  },
});

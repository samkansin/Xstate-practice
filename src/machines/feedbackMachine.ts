import { createMachine } from "xstate";

export const feedbackMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QDMyQEYEMDGBrAdAI4CucALgJYD2AdgMSoY4FRVUQDaADALqKgAHKrAqVa-EAA9EARgCsATnwAWBQCYZADgDscgDQgAnok0z8cgL5WDNdnAmMIWPBKEixNCdIQBaAGwGxr5+1iCOzgQk5NSeSCBuojFeiMpqgSZqoeHM+GQAFpg0uPBxCR7JCADMlWbamgpcfmr6RhlWVkA */
    id: 'feedback',
    initial: 'question',
    states: {
        question: {
            on: {
                'feedback.good': {
                    target: 'thanks',
                }
            }
        },
        thanks: {
        }
    }
})
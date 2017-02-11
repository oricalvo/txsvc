import {enableLogging} from "./logger";
enableLogging(false);

import {AppStore} from "./AppStore";
import {ServiceStore} from "./ServiceStore";
import {Transaction} from "./decorators";
import {collectValues} from "../spec/collectValues";
import {toBeEqualArray} from "../spec/toBeEqualArray";

describe("ServiceStore", function() {
    interface AppState {
        counters: CounterState,
    }

    class RootStore {
        store: ServiceStore<AppState> = new ServiceStore<AppState>({
            path: "/",
            initialState: {
                counters: null,
            }
        });

        constructor(private counterStore: CounterStore, private authStore: AuthStore) {
        }

        get state() {
            return this.store.getState();
        }

        @Transaction()
        async incAndFail() {
            this.counterStore.inc();
            throw new Error("Ooops");
        }

        @Transaction()
        async incAndLogin(userName: string) {
            this.counterStore.inc();
            await this.authStore.login(userName);
        }
    }

    interface CounterState {
        value: number;
    }

    class CounterStore {
        store: ServiceStore<CounterState> = new ServiceStore<CounterState>({
            path: "counters",
            initialState: {
                value: 0,
            }
        });

        get state() {
            return this.store.getState();
        }

        @Transaction()
        inc() {
            this.store.update({
                value: this.state.value + 1,
            });
        }
    }

    interface AuthState {
        userName: string;
    }

    class AuthStore {
        store: ServiceStore<AuthState> = new ServiceStore<AuthState>({
            path: "auth",
            initialState: {
                userName: null,
            }
        });

        get state() {
            return this.store.getState();
        }

        @Transaction()
        login(userName: string) {
            return Promise.resolve().then(()=> {
                this.store.update({
                    userName: userName,
                });
            });
        }
    }

    let appStore: AppStore<AppState>;
    let counterStore: CounterStore;
    let authStore: AuthStore;
    let rootStore: RootStore;

    beforeEach(function() {
        jasmine.addMatchers({
            toBeEqualArray: toBeEqualArray
        });

        appStore = new AppStore<AppState>();
        counterStore = new CounterStore();
        authStore = new AuthStore();
        rootStore = new RootStore(counterStore, authStore);

        appStore.init([
            rootStore.store,
            authStore.store,
            counterStore.store
        ]);
    });

    it("with @Transaction automatically commits changes to appStore", async function(done) {
        await counterStore.inc();
        expect(rootStore.state.counters.value).toBe(1);

        done();
    });

    it("Commits supports nested trasactions", async function(done) {
        await rootStore.incAndLogin("Ori");
        expect(rootStore.state).toEqual({
            counters: {
                value: 1,
            },
            auth: {
                userName: "Ori"
            }
        });

        done();
    });

    it("No commit in case of exception", async function(done) {
        const beforeState = collectValues(rootStore.state);
        try {
            await rootStore.incAndFail();
        }
        catch(err) {
        }
        const afterState = collectValues(rootStore.state);

        expect(afterState).toBeEqualArray(beforeState);

        done();
    });
});

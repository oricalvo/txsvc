import {enableLogging} from "./logger";
enableLogging(false);

import {AppStore} from "./AppStore";
import {ServiceStore} from "./ServiceStore";
import {Transaction} from "./decorators";
import {collectValues} from "../spec/collectValues";
import {toBeEqualArray} from "../spec/toBeEqualArray";
import {toDeeplyEqual} from "../spec/toDeeplyEqual";
import {TransactionScope} from "./TransactionScope";

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
        roles: string[];
    }

    class AuthStore {
        store: ServiceStore<AuthState> = new ServiceStore<AuthState>({
            path: "auth",
            initialState: {
                userName: null,
                roles: [],
            }
        });

        get state() {
            return this.store.getState();
        }

        @Transaction()
        login(userName: string) {
            this.store.update({
                userName: userName,
            });
        }

        @Transaction()
        loginAndRunCallback(userName: string, callback) {
            this.store.update({
                userName: userName,
            });

            callback();
            //setTimeout(callback, 100);
        }

        @Transaction()
        logout() {
            this.store.update({
                userName: null,
                roles: [],
            });
        }

        @Transaction()
        loadRoles() {
            this.store.update({
                roles: ["admin"],
            });
        }
    }

    let appStore: AppStore<AppState>;
    let counterStore: CounterStore;
    let authStore: AuthStore;
    let rootStore: RootStore;

    beforeEach(function() {
        jasmine.addMatchers({
            toBeEqualArray: toBeEqualArray,
            toDeeplyEqual: toDeeplyEqual
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

    it("Supports nested trasactions", async function(done) {
        await rootStore.incAndLogin("Ori");

        expect(rootStore.state).toDeeplyEqual({
            counters: {
                value: 1,
            },
            auth: {
                userName: "Ori",
                roles: [],
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

    it("Does not allow second commit", async function(done) {
        let tranScope;
        await authStore.loginAndRunCallback("userName", function() {
            tranScope = TransactionScope.current();
        });

        expect(() => {
            tranScope.commit();
        }).toThrow(new Error("Transaction was already committed"));

        done();
    });

    it("subscribeTo fires when specific property has changed", async function (done) {
        let fired = false;
        authStore.store.subscribeTo("userName", (newState, oldState)=> {
            fired = true;
        });

        await authStore.login("Ori");

        //await authStore.logout();

        expect(fired).toBe(true);
        //expect(authStore.state).toEqual({userName: null, roles: []});

        done();
    });

    it("subscribeTo does not fire on specific property that was not changed", async function (done) {
        let fired;
        authStore.store.subscribeTo("userName", (newState, oldState)=> {
            fired = true;
        });
        fired = false;


        expect(fired).toBe(false);

        done();
    });
});

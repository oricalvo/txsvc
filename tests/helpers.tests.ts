import {set, setNoClone} from "../fx/helpers";

const state = {
    name: "Ori",
    localeId: 1,
    locale: {
        id: 1,
        name: "en",
    }
};

(function() {
    const res = set(state, "name", "Roni");
    console.log(state !== res);
})();

(function() {
    const res = set(state, "locale.id", 2);
    console.log(state !== res && state.locale !== res.locale);
})();

(function() {
    const res = set(state, "locale", {
        id: 2,
        name: "he",
    });
    console.log(state !== res && state.locale !== res.locale);
})();

(function() {
    const res = set(state, "/", {
        localeId: 2,
        locale: {
            id: 2,
            name: "he",
        }
    });
    console.log(state !== res && state.locale !== res.locale);
})();

(function() {
    setNoClone(state, "/", {
        localeId: 3,
    });
    console.log(state.localeId !== 3);
})();

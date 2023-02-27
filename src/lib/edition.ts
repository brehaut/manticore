import { browser } from '$app/environment';

import { Edition } from "./costs";

const EDITION_STATE_KEY = "state.edition";

const defaultEdition = Edition.First;

export function getEdition(): Edition {
    if (browser) {
        const editionName = localStorage.getItem(EDITION_STATE_KEY);
        if (editionName === null) return defaultEdition;
        if (editionName === Edition.First || editionName === Edition.Second) return editionName;
    }
    return defaultEdition;
}

export function saveEdition(edition: Edition) {
    if (browser) {
        if (edition === Edition.First) { // While in alpha, store an edition in storage. allows defaulting to 2e to be painless in the future
            localStorage.removeItem(EDITION_STATE_KEY);
        }
        else {
            localStorage.setItem(EDITION_STATE_KEY, edition);
        }
    }
}

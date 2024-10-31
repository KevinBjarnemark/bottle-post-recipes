
const appState = {
    loadingItems: [],
};

export const setLoading = (bool) => {
    if (bool){
        appState.loadingItems.push(".");
    }else {
        appState.loadingItems.pop(".");
    }

    const loadingContainer = document.getElementById("loading-container");
    if (appState.loadingItems.length === 0) {
        loadingContainer.style.display = "none";
    }else {
        loadingContainer.style.display = "flex";
    }
};

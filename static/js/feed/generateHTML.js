
export const htmlSidebarFilters = (globalHTML) => {
    const filters = [
        {
            title: "Vegan",
            border: "sidebar-settings-border-right",
            name: "Include vegan recipes",
            id: "filter-include-vegan",
            icon: "carrot",
        },
        {
            title: "Vegetarian",
            border: "sidebar-settings-border-right",
            name: "Include vegetarian recipes",
            id: "filter-include-vegitarian",
            icon: "egg",
        },
        {
            title: "Meat",
            border: "",
            name: "Include carnivore recipes",
            id: "filter-include-carnivore",
            icon: "drumstick-bite",
        },
    ];

    let htmlString = "";
    filters.forEach(i => {
        htmlString +=
        `<div class="flex-center flex-column width-third ${i.border} 
            pt-1 pb-1">
            <p class="small-font text-white">${i.title}</p>
            <i class="fa-solid fa-${i.icon} text-white fs-3"></i>
                <input 
                    class="form-check-input"
                    style="margin-top: 10px"
                    type="checkbox" 
                    name=${i.name} 
                    id=${i.id} 
                />
        </div>`;
    });

    globalHTML.filters.innerHTML = htmlString;
};

export const htmlSidebarSearchAreas = (globalHTML) => {
    const filters = [
        {
            name: "Include description in search",
            id: "search-area-description",
            label: "Description",
        },
        {
            name: "Checkbox include ingredients in search",
            id: "search-area-ingredients",
            label: "Ingredients",
        },
        {
            name: "Checkbox include tags in search",
            id: "search-area-tags",
            label: "Tags",
        },

    ];

    let htmlString = "";
    filters.forEach(i => {
        htmlString +=
        `<div class="flex-row align-items-start mb-1">
            <input 
                class="form-check-input"
                style="margin-right: 10px;" 
                type="checkbox" 
                name=${i.name}
                id=${i.id}
            />
            <label class="form-check-label text-white" for=${i.id}>
                ${i.label}
            </label>
        </div>`;
    });

    globalHTML.searchAreas.innerHTML = htmlString;
};

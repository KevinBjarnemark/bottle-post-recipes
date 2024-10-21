import { toggleFilters, toggleSearchAreaItems } from "./utilities.js";

export const htmlSidebarFilters = (globalHTML, globalVariables) => {
    const filters = [
        {
            title: "Vegan",
            border: "sidebar-settings-border-right",
            id: "filter-recipe-type-vegan",
            icon: "carrot",
        },
        {
            title: "Vegetarian",
            border: "sidebar-settings-border-right",
            id: "filter-include-vegetarian",
            icon: "egg",
        },
        {
            title: "Fish",
            border: "sidebar-settings-border-right",
            id: "filter-recipe-type-fish",
            icon: "fish",
        },
        {
            title: "Meat",
            border: "",
            id: "filter-recipe-type-meat",
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
                    name=${i.id} 
                    id=${i.id}
                checked />
        </div>`;
    });

    globalHTML.filters.innerHTML = htmlString;

    filters.forEach(i => {
        const element = document.getElementById(i.id);
        element.addEventListener('click', function() {
            toggleFilters(globalHTML, globalVariables, i.title.toLowerCase());
        });
    });
};

export const htmlSidebarSearchAreas = (globalHTML, globalVariables) => {
    const filters = [
        {
            title: "Description",
            border: "sidebar-settings-border-right",
            id: "search-area-description",
            icon: "font"
        },
        {
            title: "Ingredients",
            border: "sidebar-settings-border-right",
            id: "search-area-ingredients",
            icon: "apple-whole"

        },
        {
            title: "Tags",
            border: "",
            id: "search-area-tags",
            icon: "hashtag"

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
                    name=${i.id} 
                    id=${i.id} />
        </div>`;
    });

    globalHTML.searchAreas.innerHTML = htmlString;

    filters.forEach(i => {
        const element = document.getElementById(i.id);
        element.addEventListener('change', function(e) {
            // Extract the search area name
            const searchAreaName = i.id.split("-").pop();
            toggleSearchAreaItems(globalVariables, e.target.checked, searchAreaName);
        });
    });
};

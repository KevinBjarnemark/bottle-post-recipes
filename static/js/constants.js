
export const DEFAULT_FILTER_OBJECT = 
    {
        // Search query (string)
        q: "", 
        // Include search areas (array of strings)
        searchAreas: [],
        recipeTypes: {
            vegan: true,
            vegetarian: true,
            fish: true,
            meat: true,
        },
        userId: "",
        recipe_id: "",
    };

export const DIETARYATTRIBUTES_ALL = [
    "alcohol", 
    "dairy", 
    "meat", 
    "fish", 
    "honey", 
    "gelatin", 
    "nuts", 
    "gluten",
    "eggs",
    "soy",
    "lactose",
    "peanuts",
    "caffeine",
];

export const DIETARYATTRIBUTES_NON_VEGAN = [ 
    "dairy", 
    "meat", 
    "fish", 
    "honey", 
    "gelatin", 
    "eggs", 
    "lactose", 
];

export const RECIPE_EMPTY = {
    "title": "",
    "description": "",
    "instructions": "",
    "tags": "",
    "dietary_attributes": [],
    "ingredients": [],
    "image": null,
    "preparation_time": [
        {
            "days": 0,
            "hours": 0,
            "minutes": 0
        }
    ],
    "cooking_time": [
        {
            "days": 0,
            "hours": 0,
            "minutes": 0
        }
    ],
    "estimated_price": [
        {
            "from": 0,
            "to": 0,
        }
    ],
};

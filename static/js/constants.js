
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

import type { UnitType } from "@/types/recipe"

// Function to format unit type to Vietnamese
export const formatUnitType = (unit: UnitType): string => {
    switch (unit) {
        case "Milligram":
            return "Miligram"
        case "Gram":
            return "Gram"
        case "Kilogram":
            return "Kilogram"
        case "Milliliter":
            return "Mililít"
        case "Liter":
            return "Lít"
        case "Piece":
            return "Cái"
        case "Teaspoon":
            return "Thìa cà phê"
        case "Tablespoon":
            return "Thìa canh"
        default:
            return unit
    }
}

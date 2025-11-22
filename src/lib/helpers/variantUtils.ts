/**
 * Parse attributes from JSON string stored in database
 * Handles both string (JSON) and object formats
 */
export function parseVariantAttributes(attributes: string | Record<string, any> | null): Record<string, any> | null {
  if (!attributes) return null;
  
  // If it's already an object, return it
  if (typeof attributes === 'object' && !(attributes instanceof String)) {
    return attributes;
  }
  
  // If it's a string, try to parse it
  if (typeof attributes === 'string') {
    try {
      return JSON.parse(attributes);
    } catch (error) {
      console.error("Error parsing variant attributes:", error);
      return null;
    }
  }
  
  return null;
}

/**
 * Stringify attributes for database storage
 */
export function stringifyVariantAttributes(attributes: Record<string, any> | null): string | null {
  if (!attributes || Object.keys(attributes).length === 0) return null;
  
  try {
    return JSON.stringify(attributes);
  } catch (error) {
    console.error("Error stringifying variant attributes:", error);
    return null;
  }
}

/**
 * Get example attributes for different product types
 */
export function getExampleAttributes(productType: string): Record<string, string> {
  const examples: Record<string, Record<string, string>> = {
    "Food": {
      "Flavor": "Chocolate",
      "Size": "Regular",
      "Dietary": "Vegan",
      "Allergens": "Nuts",
    },
    "Beverage": {
      "Flavor": "Strawberry",
      "Size": "Large",
      "Temperature": "Cold",
      "Sweetness": "Medium",
    },
    "Clothing": {
      "Size": "Medium",
      "Color": "Blue",
      "Material": "Cotton",
      "Style": "Casual",
    },
    "Electronics": {
      "Storage": "256GB",
      "Color": "Space Gray",
      "Connectivity": "WiFi + Cellular",
      "Warranty": "1 Year",
    },
    "Service": {
      "Duration": "2 Hours",
      "Location": "On-site",
      "Expertise": "Senior Level",
      "Availability": "Weekdays",
    },
    "SaaS": {
      "Plan": "Professional",
      "Users": "10",
      "Storage": "100GB",
      "Support": "Priority",
    },
  };

  return examples[productType] || {
    "Attribute": "Value",
    "Category": "Example",
  };
}

/**
 * Format price for display
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return "N/A";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
} 
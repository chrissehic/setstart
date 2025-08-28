# Master Brief Generator

A comprehensive HTML document generator that creates investor-ready Master Brief documents from workflow data. The generator produces clean, printable HTML documents that can be converted to PDF for professional presentations.

## Features

- **Complete HTML Document**: Generates a full HTML document with embedded CSS styling
- **Print-Optimized**: A4 page layout with proper page breaks and print-friendly styling
- **Professional Design**: Clean, modern layout following existing design system patterns
- **Data-Driven**: Automatically derives content from workflow objects without speculation
- **Traceability**: Includes all relevant IDs for jumping back to the original application
- **Multi-Page Layout**: Organized sections with logical page breaks

## Document Structure

The generated Master Brief includes the following sections:

1. **Cover Page** - Company name, tagline, logo, and key information
2. **Executive Summary** - High-level overview and key highlights
3. **Identity & Positioning** - Company overview and strategic position
4. **Founding Team** - Team composition and roles
5. **Product Overview** - Product portfolio with variants (up to 3 products)
6. **Roadmap** - Strategic milestones derived from objectives
7. **Risks & Assumptions** - Standard risk categories and mitigation strategies
8. **Links & Assets** - Social media, website, and digital assets
9. **Version & Provenance** - Document metadata and data sources

## Usage

### Basic Usage

```typescript
import { generateMasterBrief, type MasterBriefData } from './masterBriefGenerator';

// Prepare your data
const data: MasterBriefData = {
  workflow: workflowWithDetails,
  objectives: objectivesList,
  products: productsList,
  socialLinks: socialLinksList
};

// Generate the HTML document
const htmlDocument = generateMasterBrief(data);

// The HTML can now be:
// - Displayed in a browser
// - Converted to PDF
// - Saved to a file
// - Sent via email
```

### Integration with Existing Workflows

```typescript
// In your workflow component or API route
import { generateMasterBrief } from '@/lib/utils/masterBriefGenerator';

export async function generateWorkflowBrief(workflowId: string) {
  // Fetch workflow data with all related entities
  const workflow = await getWorkflowWithDetails(workflowId);
  const objectives = await getObjectives(workflowId);
  const products = await getProducts(workflowId);
  const socialLinks = await getSocialLinks(workflowId);
  
  // Generate the Master Brief
  const masterBrief = generateMasterBrief({
    workflow,
    objectives,
    products,
    socialLinks
  });
  
  return masterBrief;
}
```

### Example Implementation

See `masterBriefExample.ts` for a complete working example with sample data.

## Data Requirements

The generator expects the following data structure:

### Workflow
- Basic information (name, tagline, description)
- Visual assets (logos, background images)
- Stage and status information
- Tags for categorization
- Team members with roles

### Objectives
- Title and description
- Priority and creation dates
- Unique IDs for traceability

### Products
- Name, description, and type
- Product variants (if applicable)
- Pricing information
- Product images

### Social Links
- Website and social media URLs
- Platform names and handles

## Styling & Layout

- **Typography**: Clean sans-serif fonts optimized for readability
- **Colors**: Print-safe color palette with good contrast
- **Layout**: Responsive grid layouts that work on different screen sizes
- **Print Support**: CSS media queries for optimal PDF generation
- **Page Breaks**: Automatic page breaks between major sections

## Output Format

The generator produces a complete HTML document that:

- Starts with `<!DOCTYPE html>`
- Includes embedded CSS styling
- Has proper semantic HTML structure
- Includes JavaScript for page numbering
- Is self-contained (no external dependencies)

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Print functionality for PDF generation
- Responsive design for different screen sizes

## PDF Generation

To convert the HTML to PDF:

1. **Browser Print**: Use browser print functionality (Ctrl+P / Cmd+P)
2. **Print to PDF**: Select "Save as PDF" as the destination
3. **API Services**: Use services like Puppeteer or similar for automated conversion

## Customization

The generator is designed to be easily customizable:

- **CSS Variables**: Modify colors and spacing in the embedded styles
- **Layout**: Adjust grid layouts and page breaks
- **Content**: Modify section content and structure
- **Styling**: Update fonts, colors, and visual elements

## Notes

- **No Tasks**: The generator intentionally excludes task content as specified
- **Data-Driven**: Only includes content that can be derived from the provided data
- **Traceability**: All IDs are preserved for easy navigation back to the source
- **Professional**: Designed for investor and stakeholder presentations
- **Language-Neutral**: Content is business-focused without speculative claims

## Dependencies

- TypeScript for type safety
- Existing workflow types and interfaces
- No external libraries or frameworks required

## Performance

- Lightweight HTML generation
- Minimal JavaScript for page numbering
- Optimized CSS for fast rendering
- Suitable for server-side generation

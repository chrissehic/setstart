import type { WorkflowWithDetails, Objective, Product, SocialLink } from "@/types/workflow";

export interface MasterBriefData {
  workflow: WorkflowWithDetails;
  objectives: Objective[];
  products: Product[];
  socialLinks: SocialLink[];
}

export function generateMasterBrief(data: MasterBriefData): string {
  const { workflow, objectives, products, socialLinks } = data;

  // Helper functions
  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFounders = () => {
    return workflow.people.filter(person =>
      person.role.toLowerCase().includes('co-founder') ||
      person.role.toLowerCase().includes('founder')
    );
  };

  const getWebsite = () => {
    return socialLinks.find(link =>
      link.name.toLowerCase().includes('website') ||
      link.name.toLowerCase().includes('web')
    );
  };

  const getMainLogo = () => {
    return workflow.mainLogo || workflow.logoIcon || workflow.logoImage;
  };

  const getBackgroundImage = () => {
    return workflow.backgroundImage;
  };

  const today = new Date().toISOString().split('T')[0];

  const getLogoType = () => {
    const logo = getMainLogo();
    if (!logo) return 'none';
    if (logo.toLowerCase().endsWith('.svg')) return 'svg';
    return 'image';
  };

  const getLogoDisplay = () => {
    const logo = getMainLogo();
    const logoType = getLogoType();

    if (logoType === 'svg') {
      // For SVG, embed with title color adaptation
      return `<div class="logo-container">
        <div class="svg-logo" style="color: #1a1a1a;">
          <img src="${logo}" alt="Logo" class="logo" style="filter: brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%);">
        </div>
      </div>`;
    } else if (logoType === 'image') {
      // For images, show text title instead
      return `<div class="logo-container">
        <div class="text-logo">
          <h1 class="company-title">${workflow.name}</h1>
        </div>
      </div>`;
    } else {
      // No logo, just show text title
      return `<div class="logo-container">
        <div class="text-logo">
          <h1 class="company-title">${workflow.name}</h1>
        </div>
      </div>`;
    }
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${workflow.name} — Master Brief</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
      font-size: 12px;
    }
    
    .page {
      page-break-after: always;
      min-height: 29.7cm;
      padding: 2cm;
      position: relative;
    }
    
    .page:last-child {
      page-break-after: avoid;
    }
    
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 2cm;
      background: #ffffff;
      border-bottom: 1px solid #e5e5e5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2cm;
      font-size: 11px;
      color: #666;
      z-index: 100;
    }
    
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 1.5cm;
      background: #ffffff;
      border-top: 1px solid #e5e5e5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2cm;
      font-size: 10px;
      color: #666;
      z-index: 100;
    }
    
    .content {
      margin-top: 2.5cm;
      margin-bottom: 2cm;
    }
    
    h1 {
      font-size: 32px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 16px;
      color: #1a1a1a;
    }
    
    h2 {
      font-size: 24px;
      font-weight: 600;
      line-height: 1.3;
      margin: 32px 0 16px 0;
      color: #1a1a1a;
      page-break-after: avoid;
    }
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      line-height: 1.4;
      margin: 24px 0 12px 0;
      color: #1a1a1a;
      page-break-after: avoid;
    }
    
    p {
      margin-bottom: 16px;
      text-align: justify;
    }
    
    .tagline {
      font-size: 18px;
      color: #666;
      font-weight: 500;
      margin-bottom: 24px;
    }
    
    .summary {
      font-size: 14px;
      line-height: 1.7;
      color: #333;
      margin-bottom: 32px;
    }
    
    .cover-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      height: 100%;
      padding: 4cm 0;
    }
    
    .logo-container {
      margin-bottom: 48px;
    }
    
    .logo {
      max-width: 120px;
      max-height: 120px;
      object-fit: contain;
    }

    .text-logo {
  text-align: center;
  margin-bottom: 48px;
}

  .company-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.1;
  margin: 0;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: -0.02em;
}

.svg-logo {
  display: flex;
  justify-content: center;
  align-items: center;
}
    
    .background-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.1;
      z-index: -1;
    }
    
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 16px 0;
    }
    
    .tag {
      background: #f3f4f6;
      color: #374151;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 11px;
      font-weight: 500;
      border: 1px solid #d1d5db;
    }
    
    .stage-badge {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .founders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin: 24px 0;
    }
    
    .founder-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    
    .founder-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #e5e7eb;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #6b7280;
    }
    
    .founder-name {
      font-weight: 600;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    
    .founder-role {
      color: #6b7280;
      font-size: 11px;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin: 24px 0;
    }
    
    .product-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }
    
    .product-name {
      font-weight: 600;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    
    .product-description {
      color: #6b7280;
      font-size: 11px;
      margin-bottom: 16px;
    }
    
    .variants-list {
      margin-top: 12px;
    }
    
    .variant-item {
      background: #ffffff;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 8px;
    }
    
    .variant-name {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .variant-description {
      color: #6b7280;
      font-size: 10px;
    }
    
    .milestones-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 11px;
    }
    
    .milestones-table th,
    .milestones-table td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
    }
    
    .milestones-table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    
    .objectives-list {
      margin: 24px 0;
    }
    
    .objective-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
    }
    
    .objective-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    
    .objective-description {
      color: #6b7280;
      font-size: 11px;
    }
    
    .objective-id {
      color: #9ca3af;
      font-size: 10px;
      font-family: monospace;
      margin-top: 8px;
    }
    
    .risks-table {
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 11px;
    }
    
    .risks-table th,
    .risks-table td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
    }
    
    .risks-table th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    
    .links-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }
    
    .link-item {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    
    .link-name {
      font-weight: 600;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    
    .link-url {
      color: #3b82f6;
      font-size: 11px;
      word-break: break-all;
    }
    
    .provenance {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 20px;
      margin: 32px 0;
      font-family: monospace;
      font-size: 10px;
      color: #374151;
      white-space: pre-wrap;
    }
    
    .page-number {
      text-align: center;
      color: #9ca3af;
      font-size: 10px;
    }
    
    @media print {
      .page {
        page-break-after: always;
      }
      
      .page:last-child {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <span>${workflow.name} — Master Brief</span>
    <span>Generated: ${today}</span>
  </div>
  
  <div class="footer">
    <span>Workflow ID: ${workflow.id}</span>
    <span class="page-number">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
  </div>

  <!-- Cover Page -->
  <div class="page">
    ${getBackgroundImage() ? `<img src="${getBackgroundImage()}" alt="Background" class="background-image">` : ''}
    <div class="content">
      <div class="cover-content">
      ${getLogoDisplay()}
        ${workflow.tagline ? `<div class="tagline">${workflow.tagline}</div>` : ''}
        ${workflow.description ? `<div class="summary">${truncateText(workflow.description, 200)}</div>` : ''}
        <div class="stage-badge">${workflow.stage || workflow.status}</div>
        ${workflow.tags && workflow.tags.length > 0 ? `
        <div class="tags">
          ${workflow.tags.map(tag => `<span class="tag">${tag.name}</span>`).join('')}
        </div>
        ` : ''}
      </div>
    </div>
  </div>

  <!-- Executive Summary -->
  <div class="page">
    <div class="content">
      <h2>Executive Summary</h2>
      ${workflow.description ? `
      <p class="summary">${truncateText(workflow.description, 200)}</p>
      ` : '<p>This workflow represents a strategic initiative with defined objectives and product roadmap.</p>'}
      
      <h3>Key Highlights</h3>
      <ul>
        <li><strong>Stage:</strong> ${workflow.stage || workflow.status}</li>
        <li><strong>Objectives:</strong> ${objectives.length} defined</li>
        <li><strong>Products:</strong> ${products.length} in portfolio</li>
        <li><strong>Team:</strong> ${workflow.people.length} members</li>
        ${workflow.estimatedDuration ? `<li><strong>Timeline:</strong> ${workflow.estimatedDuration}</li>` : ''}
      </ul>
      
      ${workflow.tags && workflow.tags.length > 0 ? `
      <h3>Strategic Focus Areas</h3>
      <div class="tags">
        ${workflow.tags.map(tag => `<span class="tag">${tag.name}</span>`).join('')}
      </div>
      ` : ''}
    </div>
  </div>

  <!-- Identity & Positioning -->
  <div class="page">
    <div class="content">
      <h2>Identity & Positioning</h2>
      
      <h3>Company Overview</h3>
      <p><strong>Name:</strong> ${workflow.name}</p>
      ${workflow.tagline ? `<p><strong>Tagline:</strong> ${workflow.tagline}</p>` : ''}
      ${workflow.description ? `<p><strong>Description:</strong> ${workflow.description}</p>` : ''}
      
      <h3>Strategic Position</h3>
      <p><strong>Current Stage:</strong> ${workflow.stage || workflow.status}</p>
      ${workflow.estimatedDuration ? `<p><strong>Estimated Duration:</strong> ${workflow.estimatedDuration}</p>` : ''}
      
      ${workflow.tags && workflow.tags.length > 0 ? `
      <h3>Market Positioning</h3>
      <div class="tags">
        ${workflow.tags.map(tag => `<span class="tag">${tag.name}</span>`).join('')}
      </div>
      ` : ''}
    </div>
  </div>

  <!-- Founding Team -->
  <div class="page">
    <div class="content">
      <h2>Founding Team</h2>
      
      ${getFounders().length > 0 ? `
      <div class="founders-grid">
        ${getFounders().map(person => `
        <div class="founder-card">
          ${person.person.avatarImage ? `
          <img src="${person.person.avatarImage}" alt="${person.person.name}" class="founder-avatar">
          ` : `
          <div class="founder-avatar">${person.person.name.charAt(0).toUpperCase()}</div>
          `}
          <div class="founder-name">${person.person.name}</div>
          <div class="founder-role">${person.role}</div>
        </div>
        `).join('')}
      </div>
      ` : `
      <p>Team composition and roles are being defined as part of the workflow development process.</p>
      `}
      
      ${workflow.people.length > 0 ? `
      <h3>Full Team Overview</h3>
      <p><strong>Total Team Members:</strong> ${workflow.people.length}</p>
      <ul>
        ${workflow.people.map(person => `<li><strong>${person.person.name}</strong> - ${person.role}</li>`).join('')}
      </ul>
      ` : ''}
    </div>
  </div>

  <!-- Product Overview -->
  <div class="page">
    <div class="content">
      <h2>Product Overview</h2>
      
      ${products.length > 0 ? `
      <div class="products-grid">
        ${products.slice(0, 3).map(product => `
        <div class="product-card">
          <div class="product-name">${product.name}</div>
          ${product.description ? `<div class="product-description">${truncateText(product.description, 150)}</div>` : ''}
          ${product.type ? `<div><strong>Type:</strong> ${product.type}</div>` : ''}
          ${product.variants && product.variants.length > 0 ? `
          <div class="variants-list">
            <strong>Variants (${Math.min(product.variants.length, 3)}):</strong>
            ${product.variants.slice(0, 3).map(variant => `
            <div class="variant-item">
              <div class="variant-name">${variant.name}</div>
              ${variant.description ? `<div class="variant-description">${truncateText(variant.description, 100)}</div>` : ''}
              ${variant.price ? `<div><strong>Price:</strong> $${variant.price}</div>` : ''}
            </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
        `).join('')}
      </div>
      ` : `
      <p>Product portfolio is being developed as part of the strategic planning process.</p>
      `}
      
      ${products.length > 3 ? `
      <p><em>Note: ${products.length - 3} additional products in portfolio (not shown)</em></p>
      ` : ''}
    </div>
  </div>

  <!-- Roadmap -->
  <div class="page">
    <div class="content">
      <h2>Roadmap</h2>
      
      ${objectives.length > 0 ? `
      <h3>Strategic Milestones</h3>
      <table class="milestones-table">
        <thead>
          <tr>
            <th>Milestone</th>
            <th>Description</th>
            <th>Priority</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${objectives.map(objective => `
          <tr>
            <td><strong>${objective.title}</strong></td>
            <td>${objective.description ? truncateText(objective.description, 100) : 'No description'}</td>
            <td>${objective.priority || 'Not set'}</td>
            <td>${formatDate(objective.createdAt)}</td>
          </tr>
          `).join('')}
        </tbody>
      </table>
      
      <h3>Detailed Objectives</h3>
      <div class="objectives-list">
        ${objectives.map(objective => `
        <div class="objective-item">
          <div class="objective-title">${objective.title}</div>
          ${objective.description ? `<div class="objective-description">${truncateText(objective.description, 300)}</div>` : ''}
          <div class="objective-id">ID: ${objective.id}</div>
        </div>
        `).join('')}
      </div>
      ` : `
      <p>Strategic objectives are being defined as part of the workflow development process.</p>
      `}
    </div>
  </div>

  <!-- Risks & Assumptions -->
  <div class="page">
    <div class="content">
      <h2>Risks & Assumptions</h2>
      
      <h3>Identified Risk Factors</h3>
      <table class="risks-table">
        <thead>
          <tr>
            <th>Risk Category</th>
            <th>Description</th>
            <th>Mitigation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Market Risk</td>
            <td>Competitive landscape and market dynamics</td>
            <td>Continuous market research and competitive analysis</td>
          </tr>
          <tr>
            <td>Execution Risk</td>
            <td>Timeline and resource constraints</td>
            <td>Agile methodology and regular milestone reviews</td>
          </tr>
          <tr>
            <td>Team Risk</td>
            <td>Key personnel availability and skills</td>
            <td>Cross-training and knowledge documentation</td>
          </tr>
        </tbody>
      </table>
      
      <h3>Key Assumptions</h3>
      <ul>
        <li>Market conditions remain favorable for the planned timeline</li>
        <li>Required resources and expertise are available</li>
        <li>Technology stack and tools remain current and supported</li>
        <li>Regulatory environment remains stable</li>
      </ul>
      
      ${workflow.tags && workflow.tags.length > 0 ? `
      <h3>Contextual Considerations</h3>
      <p>Based on the identified focus areas:</p>
      <div class="tags">
        ${workflow.tags.map(tag => `<span class="tag">${tag.name}</span>`).join('')}
      </div>
      ` : ''}
    </div>
  </div>

  <!-- Links & Assets -->
  <div class="page">
    <div class="content">
      <h2>Links & Assets</h2>
      
      ${socialLinks.length > 0 ? `
      <div class="links-grid">
        ${socialLinks.map(link => `
        <div class="link-item">
          <div class="link-name">${link.name}</div>
          <div class="link-url">${link.url}</div>
          ${link.handle ? `<div><strong>Handle:</strong> ${link.handle}</div>` : ''}
        </div>
        `).join('')}
      </div>
      ` : `
      <p>Social media and web presence links are being established as part of the go-to-market strategy.</p>
      `}
      
      <h3>Digital Assets</h3>
      <ul>
        ${getMainLogo() ? `<li><strong>Main Logo:</strong> Available</li>` : ''}
        ${getBackgroundImage() ? `<li><strong>Background Image:</strong> Available</li>` : ''}
        ${workflow.logoImage ? `<li><strong>Logo Image:</strong> Available</li>` : ''}
        ${workflow.additionalAssets ? `<li><strong>Additional Assets:</strong> ${workflow.additionalAssets.length} available</li>` : ''}
      </ul>
      
      ${getWebsite() ? `
      <h3>Primary Website</h3>
      <p><strong>URL:</strong> <a href="${getWebsite()?.url}">${getWebsite()?.url}</a></p>
      ` : ''}
    </div>
  </div>

  <!-- Version & Provenance -->
  <div class="page">
    <div class="content">
      <h2>Version & Provenance</h2>
      
      <h3>Document Information</h3>
      <ul>
        <li><strong>Generated:</strong> ${today}</li>
        <li><strong>Workflow ID:</strong> ${workflow.id}</li>
        <li><strong>Workflow Name:</strong> ${workflow.name}</li>
        <li><strong>Last Updated:</strong> ${formatDate(workflow.updatedAt)}</li>
        <li><strong>Created:</strong> ${formatDate(workflow.createdAt)}</li>
      </ul>
      
      <h3>Data Provenance</h3>
      <div class="provenance">{
  "workflowId": "${workflow.id}",
  "generatedAt": "${today}",
  "dataSources": {
    "objectives": [${objectives.map(obj => `"${obj.id}"`).join(', ')}],
    "products": [${products.map(prod => `"${prod.id}"`).join(', ')}],
    "people": [${workflow.people.map(person => `"${person.person.id}"`).join(', ')}],
    "tags": [${workflow.tags.map(tag => `"${tag.name}"`).join(', ')}]
  },
  "totalCounts": {
    "objectives": ${objectives.length},
    "products": ${products.length},
    "people": ${workflow.people.length},
    "tags": ${workflow.tags.length}
  }
}</div>
      
      <h3>Notes</h3>
      <ul>
        <li>This document is automatically generated from workflow data</li>
        <li>All IDs are traceable back to the original workflow application</li>
        <li>Content is derived from structured data fields only</li>
        <li>For the most current information, refer to the live workflow</li>
      </ul>
    </div>
  </div>

  <script>
    // Simple page numbering
    const pages = document.querySelectorAll('.page');
    const totalPages = pages.length;
    
    pages.forEach((page, index) => {
      const pageNumber = page.querySelector('.pageNumber');
      if (pageNumber) {
        pageNumber.textContent = index + 1;
      }
    });
    
    document.querySelectorAll('.totalPages').forEach(el => {
      el.textContent = totalPages;
    });
  </script>
</body>
</html>`;
}

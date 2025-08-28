import { generateMasterBrief, type MasterBriefData } from './masterBriefGenerator';

// Example usage of the Master Brief generator
export function createExampleMasterBrief(): string {
  // Sample data structure (this would normally come from your database)
  const sampleData: MasterBriefData = {
    workflow: {
      id: "clx1234567890",
      userId: "user123",
      name: "EcoTech Solutions",
      tagline: "Sustainable technology for a greener tomorrow",
      description: "EcoTech Solutions is a forward-thinking company developing innovative sustainable technologies that address critical environmental challenges. Our mission is to create scalable solutions that reduce carbon footprints while maintaining economic viability for businesses and consumers alike.",
      logoImage: "https://example.com/logo.png",
      backgroundImage: "https://example.com/background.jpg",
      mainLogo: "https://example.com/main-logo.svg",
      logoIcon: "https://example.com/icon.svg",
      additionalAssets: ["https://example.com/brochure.pdf", "https://example.com/presentation.pptx"],
      estimatedDuration: "18-24 months",
      stage: "existence",
      status: "BLUEPRINT",
      definition: "A comprehensive workflow for launching sustainable technology products",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-20"),
      tags: [
        { id: "tag1", name: "Sustainability" },
        { id: "tag2", name: "Technology" },
        { id: "tag3", name: "Green Energy" },
        { id: "tag4", name: "Innovation" }
      ],
      people: [
        {
          workflowId: "clx1234567890",
          personId: "person1",
          role: "Co-founder & CEO",
          person: {
            id: "person1",
            name: "Sarah Johnson",
            avatarImage: "https://example.com/sarah.jpg"
          }
        },
        {
          workflowId: "clx1234567890",
          personId: "person2",
          role: "Co-founder & CTO",
          person: {
            id: "person2",
            name: "Michael Chen",
            avatarImage: "https://example.com/michael.jpg"
          }
        },
        {
          workflowId: "clx1234567890",
          personId: "person3",
          role: "Head of Engineering",
          person: {
            id: "person3",
            name: "Alex Rodriguez",
            avatarImage: null
          }
        }
      ]
    },
    objectives: [
      {
        id: "obj1",
        workflowId: "clx1234567890",
        title: "Product Development & Testing",
        description: "Complete the development and rigorous testing of our flagship sustainable energy solution, ensuring it meets industry standards and customer requirements.",
        priority: "HIGH",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20")
      },
      {
        id: "obj2",
        workflowId: "clx1234567890",
        title: "Market Validation & Customer Acquisition",
        description: "Validate market demand through pilot programs and acquire initial customers to prove product-market fit.",
        priority: "HIGH",
        createdAt: new Date("2024-01-16"),
        updatedAt: new Date("2024-01-20")
      },
      {
        id: "obj3",
        workflowId: "clx1234567890",
        title: "Regulatory Compliance & Certification",
        description: "Obtain necessary regulatory approvals and industry certifications to ensure our products meet all safety and environmental standards.",
        priority: "MEDIUM",
        createdAt: new Date("2024-01-17"),
        updatedAt: new Date("2024-01-20")
      }
    ],
    products: [
      {
        id: "prod1",
        workflowId: "clx1234567890",
        name: "EcoPower Solar Panel",
        description: "High-efficiency solar panels with integrated energy storage capabilities, designed for residential and commercial applications.",
        type: "Hardware",
        image: "https://example.com/solar-panel.jpg",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20"),
        variants: [
          {
            id: "var1",
            productId: "prod1",
            name: "Residential Standard",
            description: "Standard residential solar panel with 400W output",
            attributes: '{"power": "400W", "efficiency": "22%", "size": "1.6m x 1.0m"}',
            price: 299.99,
            image: "https://example.com/residential.jpg",
            isActive: true,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-20")
          },
          {
            id: "var2",
            productId: "prod1",
            name: "Commercial Premium",
            description: "High-performance commercial panel with 500W output",
            attributes: '{"power": "500W", "efficiency": "24%", "size": "1.8m x 1.1m"}',
            price: 449.99,
            image: "https://example.com/commercial.jpg",
            isActive: true,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-20")
          }
        ]
      },
      {
        id: "prod2",
        workflowId: "clx1234567890",
        name: "EcoMonitor Energy Management System",
        description: "AI-powered energy management software that optimizes energy consumption and provides real-time insights for businesses.",
        type: "Software",
        image: "https://example.com/software.jpg",
        createdAt: new Date("2024-01-16"),
        updatedAt: new Date("2024-01-20"),
        variants: []
      }
    ],
    socialLinks: [
      {
        id: "social1",
        workflowId: "clx1234567890",
        name: "Website",
        url: "https://ecotechsolutions.com",
        handle: null,
        icon: "globe",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20")
      },
      {
        id: "social2",
        workflowId: "clx1234567890",
        name: "LinkedIn",
        url: "https://linkedin.com/company/ecotechsolutions",
        handle: "@ecotechsolutions",
        icon: "linkedin",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20")
      },
      {
        id: "social3",
        workflowId: "clx1234567890",
        name: "Twitter",
        url: "https://twitter.com/ecotechsolutions",
        handle: "@ecotechsolutions",
        icon: "twitter",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-20")
      }
    ]
  };

  // Generate the Master Brief HTML
  return generateMasterBrief(sampleData);
}

// Function to save the generated HTML to a file (for testing purposes)
export function downloadMasterBrief(htmlContent: string, filename: string = "master-brief.html") {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Example of how to use in a React component or API route
export async function generateWorkflowMasterBrief(workflowId: string): Promise<string> {
  // This would typically fetch data from your database
  // const workflow = await getWorkflowWithDetails(workflowId);
  // const objectives = await getObjectives(workflowId);
  // const products = await getProducts(workflowId);
  // const socialLinks = await getSocialLinks(workflowId);
  
  // For now, return the example
  return createExampleMasterBrief();
}

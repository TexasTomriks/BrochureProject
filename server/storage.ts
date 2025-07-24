import { 
  users, campaigns, products, campaignProducts, templates, logos,
  type User, type InsertUser, type Campaign, type InsertCampaign,
  type Product, type InsertProduct, type CampaignProduct, type InsertCampaignProduct,
  type Template, type InsertTemplate, type Logo, type InsertLogo
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Campaigns
  getCampaigns(userId: number): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;

  // Products
  getProducts(search?: string, category?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Campaign Products
  getCampaignProducts(campaignId: number): Promise<CampaignProduct[]>;
  addProductToCampaign(campaignProduct: InsertCampaignProduct): Promise<CampaignProduct>;
  updateCampaignProduct(id: number, updates: Partial<CampaignProduct>): Promise<CampaignProduct | undefined>;
  removeCampaignProduct(id: number): Promise<boolean>;

  // Templates
  getTemplates(userId: number): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  deleteTemplate(id: number): Promise<boolean>;

  // Logos
  getLogos(userId: number): Promise<Logo[]>;
  getActiveLogo(userId: number): Promise<Logo | undefined>;
  createLogo(logo: InsertLogo): Promise<Logo>;
  setActiveLogo(userId: number, logoId: number): Promise<boolean>;
  deleteLogo(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private products: Map<number, Product>;
  private campaignProducts: Map<number, CampaignProduct>;
  private templates: Map<number, Template>;
  private logos: Map<number, Logo>;
  private currentUserId: number;
  private currentCampaignId: number;
  private currentProductId: number;
  private currentCampaignProductId: number;
  private currentTemplateId: number;
  private currentLogoId: number;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.products = new Map();
    this.campaignProducts = new Map();
    this.templates = new Map();
    this.logos = new Map();
    this.currentUserId = 1;
    this.currentCampaignId = 1;
    this.currentProductId = 1;
    this.currentCampaignProductId = 1;
    this.currentTemplateId = 1;
    this.currentLogoId = 1;

    this.seedData();
  }

  private seedData() {
    // Create test user
    const testUser: User = {
      id: 1,
      username: "test",
      password: "test",
      name: "Sarah Johnson"
    };
    this.users.set(1, testUser);

    // Seed products
    const sampleProducts: Product[] = [
      {
        id: 1,
        name: "Premium Wireless Headphones",
        category: "Electronics",
        originalPrice: 199.99,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "High-quality wireless headphones with noise cancellation"
      },
      {
        id: 2,
        name: "Latest Smartphone Pro",
        category: "Electronics",
        originalPrice: 899.99,
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Latest flagship smartphone with advanced features"
      },
      {
        id: 3,
        name: "Gaming Laptop",
        category: "Electronics",
        originalPrice: 1299.99,
        imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "High-performance gaming laptop"
      },
      {
        id: 4,
        name: "Smart Watch",
        category: "Electronics",
        originalPrice: 299.99,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        description: "Feature-rich smartwatch with health tracking"
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
    this.currentProductId = 5;

    // Seed campaigns
    const sampleCampaigns: Campaign[] = [
      {
        id: 1,
        name: "Summer Electronics Sale",
        description: "Electronics & Gadgets",
        status: "active",
        userId: 1,
        templateId: 1,
        companyName: "TechStore Pro",
        validUntil: "Dec 31, 2023",
        createdAt: new Date("2023-12-15")
      },
      {
        id: 2,
        name: "Holiday Fashion Collection",
        description: "Fashion & Apparel",
        status: "draft",
        userId: 1,
        templateId: null,
        companyName: "StyleHub",
        validUntil: "Jan 15, 2024",
        createdAt: new Date("2023-12-12")
      },
      {
        id: 3,
        name: "Black Friday Deals",
        description: "Mixed Categories",
        status: "completed",
        userId: 1,
        templateId: 1,
        companyName: "MegaDeals",
        validUntil: "Nov 30, 2023",
        createdAt: new Date("2023-11-20")
      }
    ];

    sampleCampaigns.forEach(campaign => {
      this.campaigns.set(campaign.id, campaign);
    });
    this.currentCampaignId = 4;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Campaigns
  async getCampaigns(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(campaign => campaign.userId === userId);
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentCampaignId++;
    const campaign: Campaign = { 
      id,
      name: insertCampaign.name,
      description: insertCampaign.description || null,
      status: insertCampaign.status || "draft",
      userId: insertCampaign.userId,
      templateId: insertCampaign.templateId || null,
      companyName: insertCampaign.companyName || null,
      validUntil: insertCampaign.validUntil || null,
      createdAt: new Date() 
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updates: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updatedCampaign = { ...campaign, ...updates };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Products
  async getProducts(search?: string, category?: string): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (search) {
      products = products.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category && category !== "all") {
      products = products.filter(product => product.category === category);
    }

    return products;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      id,
      name: insertProduct.name,
      category: insertProduct.category,
      originalPrice: insertProduct.originalPrice,
      description: insertProduct.description || null,
      imageUrl: insertProduct.imageUrl || null
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Campaign Products
  async getCampaignProducts(campaignId: number): Promise<CampaignProduct[]> {
    return Array.from(this.campaignProducts.values()).filter(cp => cp.campaignId === campaignId);
  }

  async addProductToCampaign(insertCampaignProduct: InsertCampaignProduct): Promise<CampaignProduct> {
    const id = this.currentCampaignProductId++;
    const campaignProduct: CampaignProduct = { 
      id,
      campaignId: insertCampaignProduct.campaignId,
      productId: insertCampaignProduct.productId,
      quantity: insertCampaignProduct.quantity || 1,
      discountPercent: insertCampaignProduct.discountPercent || 0,
      newPrice: insertCampaignProduct.newPrice,
      positionX: insertCampaignProduct.positionX || null,
      positionY: insertCampaignProduct.positionY || null
    };
    this.campaignProducts.set(id, campaignProduct);
    return campaignProduct;
  }

  async updateCampaignProduct(id: number, updates: Partial<CampaignProduct>): Promise<CampaignProduct | undefined> {
    const campaignProduct = this.campaignProducts.get(id);
    if (!campaignProduct) return undefined;

    const updated = { ...campaignProduct, ...updates };
    this.campaignProducts.set(id, updated);
    return updated;
  }

  async removeCampaignProduct(id: number): Promise<boolean> {
    return this.campaignProducts.delete(id);
  }

  // Templates
  async getTemplates(userId: number): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(template => template.userId === userId);
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentTemplateId++;
    const template: Template = { 
      id,
      name: insertTemplate.name,
      description: insertTemplate.description || null,
      filePath: insertTemplate.filePath,
      thumbnailPath: insertTemplate.thumbnailPath || null,
      userId: insertTemplate.userId,
      createdAt: new Date() 
    };
    this.templates.set(id, template);
    return template;
  }

  async deleteTemplate(id: number): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Logos
  async getLogos(userId: number): Promise<Logo[]> {
    return Array.from(this.logos.values()).filter(logo => logo.userId === userId);
  }

  async getActiveLogo(userId: number): Promise<Logo | undefined> {
    return Array.from(this.logos.values()).find(logo => logo.userId === userId && logo.isActive);
  }

  async createLogo(insertLogo: InsertLogo): Promise<Logo> {
    const id = this.currentLogoId++;
    const logo: Logo = { 
      id,
      name: insertLogo.name,
      filePath: insertLogo.filePath,
      isActive: insertLogo.isActive || false,
      userId: insertLogo.userId,
      createdAt: new Date() 
    };
    this.logos.set(id, logo);
    return logo;
  }

  async setActiveLogo(userId: number, logoId: number): Promise<boolean> {
    // Set all logos for this user as inactive
    const userLogos = Array.from(this.logos.values()).filter(logo => logo.userId === userId);
    userLogos.forEach(logo => {
      logo.isActive = false;
      this.logos.set(logo.id, logo);
    });

    // Set the specified logo as active
    const logo = this.logos.get(logoId);
    if (logo && logo.userId === userId) {
      logo.isActive = true;
      this.logos.set(logoId, logo);
      return true;
    }
    return false;
  }

  async deleteLogo(id: number): Promise<boolean> {
    return this.logos.delete(id);
  }
}

export const storage = new MemStorage();
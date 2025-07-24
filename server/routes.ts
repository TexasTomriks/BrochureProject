import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertCampaignSchema, insertCampaignProductSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads - use persistent directory
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { id: user.id, username: user.username, name: user.name } });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Campaigns
  app.get("/api/campaigns", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const campaigns = await storage.getCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);

      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(400).json({ message: "Invalid campaign data" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const campaign = await storage.updateCampaign(id, updates);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCampaign(id);

      if (!deleted) {
        return res.status(404).json({ message: "Campaign not found" });
      }

      res.json({ message: "Campaign deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const search = req.query.search as string;
      const category = req.query.category as string;

      const products = await storage.getProducts(search, category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", upload.single("image"), async (req, res) => {
    try {
      const { name, description, originalPrice, category } = req.body;

      const productData = {
        name,
        description: description || null,
        originalPrice: parseFloat(originalPrice),
        category,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      };

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", upload.single("image"), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, originalPrice, category } = req.body;

      const updates: any = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description || null;
      if (originalPrice) updates.originalPrice = parseFloat(originalPrice);
      if (category) updates.category = category;
      if (req.file) updates.imageUrl = `/uploads/${req.file.filename}`;

      const product = await storage.updateProduct(id, updates);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);

      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Campaign Products
  app.get("/api/campaigns/:campaignId/products", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const campaignProducts = await storage.getCampaignProducts(campaignId);

      // Enrich with product details
      const enrichedProducts = await Promise.all(
        campaignProducts.map(async (cp) => {
          const product = await storage.getProduct(cp.productId);
          return { ...cp, product };
        })
      );

      res.json(enrichedProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaign products" });
    }
  });

  app.post("/api/campaigns/:campaignId/products", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const productData = { ...req.body, campaignId };

      const campaignProduct = await storage.addProductToCampaign(productData);
      res.status(201).json(campaignProduct);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/campaign-products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const campaignProduct = await storage.updateCampaignProduct(id, updates);
      if (!campaignProduct) {
        return res.status(404).json({ message: "Campaign product not found" });
      }

      res.json(campaignProduct);
    } catch (error) {
      res.status(500).json({ message: "Failed to update campaign product" });
    }
  });

  app.delete("/api/campaign-products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.removeCampaignProduct(id);

      if (!deleted) {
        return res.status(404).json({ message: "Campaign product not found" });
      }

      res.json({ message: "Product removed from campaign" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove product from campaign" });
    }
  });

  // Templates
  app.get("/api/templates", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const templates = await storage.getTemplates(userId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { name, description, userId } = req.body;
      if (!name || !userId) {
        return res.status(400).json({ message: "Name and user ID are required" });
      }

      // Validate file type - allow image files and common design files for templates
      const allowedMimes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'image/svg+xml', 'application/pdf', 'text/html', 'application/postscript'
      ];

      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({ 
          message: "Invalid file type. Please upload an image, PDF, or HTML file." 
        });
      }

      const template = await storage.createTemplate({
        name,
        description: description || null,
        filePath: req.file.filename,
        userId: parseInt(userId),
      });

      res.status(201).json(template);
    } catch (error) {
      console.error("Template upload error:", error);
      res.status(500).json({ message: "Failed to upload template" });
    }
  });

  // Logos
  app.get("/api/logos", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const logos = await storage.getLogos(userId);
      res.json(logos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch logos" });
    }
  });

  app.get("/api/logos/active", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const logo = await storage.getActiveLogo(userId);
      res.json(logo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active logo" });
    }
  });

  app.post("/api/logos", upload.single("file"), async (req, res) => {
    try {
      const { name, userId } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      const logo = await storage.createLogo({
        name,
        userId: parseInt(userId),
        filePath: req.file.path,
        isActive: false,
      });

      res.status(201).json(logo);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload logo" });
    }
  });

  app.put("/api/logos/:id/activate", async (req, res) => {
    try {
      const logoId = parseInt(req.params.id);
      const { userId } = req.body;

      const success = await storage.setActiveLogo(userId, logoId);

      if (!success) {
        return res.status(404).json({ message: "Logo not found" });
      }

      res.json({ message: "Logo activated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to activate logo" });
    }
  });

  // Generate PDF (placeholder endpoint)
  app.post("/api/campaigns/:id/generate-pdf", async (req, res) => {
    try {
      // In a real implementation, you would use a library like puppeteer or jsPDF
      // to generate a PDF from the brochure design
      res.json({ 
        message: "PDF generation would be implemented here",
        downloadUrl: "/api/downloads/brochure.pdf"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Statistics endpoint
  app.get("/api/statistics", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const campaigns = await storage.getCampaigns(userId);
      const templates = await storage.getTemplates(userId);

      const stats = {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === "active").length,
        totalTemplates: templates.length,
        totalDownloads: 156, // Mock value for demo
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
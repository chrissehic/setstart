import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    console.log("=== DELETE API DEBUG ===");
    console.log("Received URL:", url);
    console.log("URL type:", typeof url);
    console.log("URL length:", url.length);

    // Extract filename from URL - handle different URL formats
    let filename: string | undefined;
    
    try {
      // Try to parse as a proper URL first
      const urlObj = new URL(url, `http://localhost`);
      filename = urlObj.pathname.split("/").pop();
      console.log("Parsed as URL, pathname:", urlObj.pathname);
    } catch {
      // If not a valid URL, try to extract filename from path-like string
      console.log("Not a valid URL, treating as path");
      filename = url.split("/").pop();
    }
    
    if (!filename) {
      console.error("Invalid URL format:", url);
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Clean the filename - remove any query parameters or fragments
    filename = filename.split("?")[0].split("#")[0];
    
    console.log("Extracted filename:", filename);

    // Construct file path
    const filePath = join(process.cwd(), "public", "uploads", filename);
    console.log("File path:", filePath);
    console.log("File exists:", existsSync(filePath));

    // Check if file exists before trying to delete
    if (!existsSync(filePath)) {
      console.error("File does not exist:", filePath);
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // Delete file from storage
    await unlink(filePath);
    console.log("File deleted successfully:", filePath);
    console.log("========================");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to delete file";
    if (error instanceof Error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'ENOENT') {
        errorMessage = "File not found";
      } else if (nodeError.code === 'EACCES') {
        errorMessage = "Permission denied";
      } else if (nodeError.code === 'EBUSY') {
        errorMessage = "File is in use";
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

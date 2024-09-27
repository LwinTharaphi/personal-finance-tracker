import connect from "@/lib/mongodb"; // Ensure correct path

export async function register() {
  console.log("Connecting to database...");
  await connect(); // Wait for the connection to resolve
  console.log("Database connected successfully.");
}

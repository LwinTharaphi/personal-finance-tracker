import connect from "@/lib/mongodb";

export async function register() {
  console.log("Connecting to database...");
  await connect();
}

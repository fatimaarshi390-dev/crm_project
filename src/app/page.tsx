import dbConnect from "@/lib/mongodb";

export default async function Home() {
  await dbConnect();

  return (
    <div>
      <h1>MongoDB Connected Successfully</h1>
    </div>
  );
}
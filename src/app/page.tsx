

export default async function Home() {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return (
    <div>
   
      <h1 className="text-center mt-10 text-3xl">
        Welcome to Hospital System
      </h1>
    </div>
  );
}
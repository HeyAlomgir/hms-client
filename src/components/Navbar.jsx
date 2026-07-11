export default function Navbar() {
  return (
    <div className="flex justify-between p-4 shadow">
      <h1 className="font-bold">Hospital</h1>

      <div className="space-x-4">
        <button>Home</button>
        <button>Doctors</button>
        <button>Login</button>
      </div>
    </div>
  );
}
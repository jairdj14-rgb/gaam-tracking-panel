export default function AlertOverlay({ alert }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-red-500/30 z-[999]">
      <div className="bg-black p-6 rounded-xl text-white text-center shadow-lg">
        <h2 className="text-xl font-bold">🚨 FRAUDE DETECTADO</h2>
        <p className="mt-2">{alert.name || "Usuario"}</p>
      </div>
    </div>
  );
}
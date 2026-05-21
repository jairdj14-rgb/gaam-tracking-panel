export default function CreateZoneModal({
  search,
  setSearch,
  searchResults,

  setTempZone,
  setFlyToZone,

  setCreatingZone,
  setSearchResults,

  tempZone,
  onSave,
  selectPlace,
}) {
  return (
    <>
      {/* SEARCH */}
      <div
        className="
          absolute top-16 left-1/2 -translate-x-1/2 md:top-4 z-[5000]

          w-[92vw] max-w-[520px]

          rounded-3xl

          border border-white/10

          bg-[#06111f]/92
          backdrop-blur-2xl

          shadow-[0_20px_80px_rgba(0,0,0,0.45)]

          p-4
        "
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-11 h-11

                rounded-2xl

                bg-cyan-400/10

                border border-cyan-400/15

                flex items-center justify-center

                text-cyan-300
              "
            >
              🔎
            </div>

            <div className="flex-1">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                placeholder="Buscar ubicación..."
                className="
    w-full h-12 px-4

    rounded-2xl

    bg-white/[0.04]

    border border-white/10

    text-white

    outline-none

    focus:border-cyan-400/30
    focus:bg-cyan-400/[0.03]

    transition-all
  "
              />

              <div className="text-xs text-white/35 mt-2">
                Busca una dirección o toca directamente el mapa
              </div>
              {tempZone && (
                <>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-white/40 uppercase tracking-[0.18em]">
                        Radio zona
                      </div>

                      <div className="text-sm text-cyan-300 font-medium">
                        {tempZone.radius}m
                      </div>
                    </div>

                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="10"
                      value={tempZone.radius}
                      onChange={(e) => {
                        setTempZone({
                          ...tempZone,
                          radius: Number(e.target.value),
                        });
                      }}
                      className="
          w-full

          accent-cyan-400

          cursor-pointer
        "
                    />
                  </div>

                  <div className="mt-4">
                    <div className="text-xs text-white/40 uppercase tracking-[0.18em] mb-2">
                      Nombre zona
                    </div>

                    <input
                      value={tempZone.name}
                      onChange={(e) => {
                        setTempZone({
                          ...tempZone,
                          name: e.target.value,
                        });
                      }}
                      placeholder="Nombre de la zona"
                      className="
          w-full h-12 px-4

          rounded-2xl

          bg-white/[0.04]

          border border-white/10

          text-white

          outline-none

          focus:border-cyan-400/30
          focus:bg-cyan-400/[0.03]

          transition-all
        "
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </form>

        {/* RESULTS */}
        {searchResults.length > 0 && (
          <div
            className="
              mt-3

              rounded-2xl

              overflow-hidden

              border border-white/10

              bg-[#020817]
            "
          >
            {searchResults.map((result, index) => (
              <button
                key={index}
                onClick={() => {
                  selectPlace(result.place_id, result.description);
                }}
                className="
      w-full p-4 text-left

      border-b border-white/5 last:border-none

      hover:bg-white/[0.04]

      transition-all duration-200
    "
              >
                <div className="text-sm text-white line-clamp-2">
                  {result.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FLOATING ACTIONS */}
      <div
        className="
    absolute

    bottom-5 left-1/2 -translate-x-1/2

    z-[5000]

    flex items-center gap-3

    rounded-3xl

    border border-white/10

    bg-[#06111f]/92
    backdrop-blur-2xl

    shadow-[0_20px_80px_rgba(0,0,0,0.45)]

    p-3
  "
      >
        <button
          onClick={() => {
            setCreatingZone(false);

            setTempZone(null);

            setSearchResults([]);
          }}
          className="
      h-12 px-5

      rounded-2xl

      border border-white/10

      bg-white/[0.08]
      hover:bg-white/[0.14]

      text-white/90
      hover:text-white

      transition-all duration-300
    "
        >
          ❌ Cancelar
        </button>

        <button
          disabled={!tempZone}
          onClick={onSave}
          className="
      h-12 px-5

      rounded-2xl

      bg-cyan-400/[0.18]
      hover:bg-cyan-400/[0.28]

      border border-cyan-400/30

      shadow-[0_4px_25px_rgba(34,211,238,0.22)]

      text-cyan-200

      font-medium

      transition-all duration-200

      disabled:opacity-40
    "
        >
          💾 Guardar zona
        </button>
      </div>
    </>
  );
}

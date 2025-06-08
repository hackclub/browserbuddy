import { Suspense } from "react";
import { EXT_CACHED_SHIPS_KEY } from "../../scripts/storage";
import { Card } from "./components/generic/Card";
import { ShipL } from "./components/links/ShipL";
import { ShipsOverview } from "./components/Shipyard";
import { useCacheItem } from "./hooks/storage";

function Ships() {
  const ships = useCacheItem(EXT_CACHED_SHIPS_KEY);

  return (
    <div className="p-2 animate-fade_in">
      <h2 className="mb-3 text-center text-2xl text-blue-500">Your Ships</h2>
      {ships ? (
        <ShipsOverview ships={ships} />
      ) : (
        <Card>
          <h2 className="text-xl font-semibold text-center">
            No ship data found in cache
          </h2>
          <h2 className="text-xl font-semibold text-center">
            Visit the <ShipL>shipyard</ShipL> to refresh
          </h2>
        </Card>
      )}
    </div>
  );
}

function App() {
  return (
    <Suspense>
      <Ships />
    </Suspense>
  );
}

export default App;

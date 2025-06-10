import type { ShipData } from "../../../scripts/storage";
import { truncateTo } from "../../../scripts/util";
import { DoubloonPill } from "./DoubloonPill";
import { Card } from "./generic/Card";
import Pill from "./generic/Pill";

export interface ShipProps {
  data: ShipData;
}

export function Ship({ data }: ShipProps) {
  return (
    <Card className="p-2 flex flex-row items-start gap-2">
      <img
        className="object-cover w-16 h-16 rounded"
        src={data.screenshotUrl}
        alt={`Screenshot of ${data.title}`}
      />
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold mb-2">{data.title}</h2>
        <div className="flex flex-row gap-2 text-gray-600 font-semibold">
          {data.updates[0].shipStatus == "shipped" ? (
            data.doubloonsPerHour && data.totalDoubloons > 0 ? (
              <DoubloonPill
                msg={`${data.totalDoubloons} doubloons (${truncateTo(data.doubloonsPerHour, 100)} per hour)`}
              />
            ) : (
              <Pill
                msg={`Pending: Awaiting payout`}
                glyphSize={20}
                glyph="clock"
              />
            )
          ) : (
            <Pill msg={`Draft`} glyphSize={20} glyph="attachment" />
          )}
        </div>
      </div>
    </Card>
  );
}

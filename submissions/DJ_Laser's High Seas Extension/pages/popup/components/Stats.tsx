import type { PropsWithChildren } from "react";
import type { ShipData } from "../../../scripts/storage";
import {
  getAvgDoubloonsPerProject,
  getAvgHoursPerProject,
  getDoubloonsPerHour,
  getTotalDoubloons,
  getTotalHours,
  truncateTo,
} from "../../../scripts/util";
import { DoubloonPill } from "./DoubloonPill";
import { Card } from "./generic/Card";
import Pill from "./generic/Pill";

function PillGroup({
  heading,
  children,
}: PropsWithChildren<{ heading: string }>) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <h2 className="text-xl font-semibold text-center">{heading}</h2>
      <div className="flex flex-wrap">{children}</div>
    </div>
  );
}

export function Stats({ ships }: { ships: ShipData[] }) {
  const doubloonsPerProject = getAvgDoubloonsPerProject(ships);
  const hoursPerProject = getAvgHoursPerProject(ships);
  const doubloonsPerHour = getDoubloonsPerHour(ships);
  const doubloonsEarned = getTotalDoubloons(ships);
  const timeSpent = getTotalHours(ships);

  const showAverage = ships.length > 0;

  return (
    <Card className="p-2 flex flex-col rounded-lg">
      <PillGroup heading="All Time:">
        <DoubloonPill msg={`${doubloonsEarned} doubloons earned`} />
        <DoubloonPill msg={`${truncateTo(timeSpent, 10)} hours shipped`} />
      </PillGroup>
      {showAverage && (
        <>
          <hr className="my-2 border-1 border-gray-300" />
          <PillGroup heading="Average:">
            <DoubloonPill
              msg={`${truncateTo(doubloonsPerHour, 10)} per hour`}
            />
            <DoubloonPill
              msg={`${truncateTo(doubloonsPerProject, 10)} per project`}
            />
            <Pill
              msg={`${truncateTo(hoursPerProject, 10)} hours per project`}
              glyphSize={20}
              glyph="clock"
            />
          </PillGroup>
        </>
      )}
    </Card>
  );
}

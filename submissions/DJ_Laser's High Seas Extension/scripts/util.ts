import type { ShipData } from "./storage";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function truncateTo(num: number, factor: number) {
  return Math.trunc(num * factor) / factor;
}

export function getTotalDoubloons(ships: ShipData[]): number {
  return ships.reduce<number>((total, ship) => total + ship.totalDoubloons, 0);
}

export function getTotalHours(ships: ShipData[]): number {
  return ships.reduce<number>((total, ship) => total + ship.paidHours, 0);
}

export function getDoubloonsPerHour(ships: ShipData[]): number {
  return getTotalDoubloons(ships) / getTotalHours(ships);
}

export function getAvgDoubloonsPerProject(ships: ShipData[]): number {
  return (
    getTotalDoubloons(ships) /
    ships.filter((ship) => ship.totalDoubloons > 0).length
  );
}

export function getAvgHoursPerProject(ships: ShipData[]): number {
  return (
    getTotalHours(ships) / ships.filter((ship) => ship.paidHours > 0).length
  );
}

// True if a ship was ever shipped, even if there are draft updates
export function isShipShipped(ship: ShipData) {
  for (const update of ship.updates) {
    if (update.shipStatus === "shipped") return true;
  }

  return false;
}

export function htmlToNode<T extends ChildNode>(html: string): T {
  const template = document.createElement("template");
  template.innerHTML = html;
  const nNodes = template.content.childNodes.length;
  if (nNodes !== 1) {
    throw new Error(
      `html parameter must represent a single node; got ${nNodes}. ` +
        "Note that leading or trailing spaces around an element in your " +
        'HTML, like " <img/> ", get parsed as text nodes neighbouring ' +
        "the element; call .trim() on your input to avoid this.",
    );
  }
  return template.content.firstChild as T;
}
